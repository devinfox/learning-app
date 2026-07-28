"use client";

import { useCallback, useEffect, useReducer, useRef, useState } from "react";
import { createGameBus, sendAndWait, type GameBus } from "../bridge/events";
import type { BuddyAtlas } from "../host/buddyAtlas";
import { createLocalHost } from "../host/localHost";
import { currentRoom, INITIAL_STATE, reduce } from "../machine/reducer";
import type { RunState } from "../machine/types";
import type { ActionId } from "../types";

const MOVE_TIMEOUT = 2500;
const INTRO_TIMEOUT = 4000;

export interface RunController {
  state: RunState;
  bus: GameBus;
  ready: boolean;
  atlas: BuddyAtlas | null | undefined;
  answer(optionIndex: number | null): void;
  requestHint(): void;
  chooseAction(action: ActionId): void;
  advance(): void;
  setSceneReady(): void;
}

export function useRun(missionId: string, reducedMotion: boolean): RunController {
  const [state, dispatch] = useReducer(reduce, INITIAL_STATE);
  const [sceneReady, setSceneReady] = useState(false);
  const [atlas, setAtlas] = useState<BuddyAtlas | null | undefined>(undefined);
  const [host] = useState(createLocalHost);
  const [bus] = useState(createGameBus);
  const handledRef = useRef("");
  const askedAtRef = useRef(0);

  useEffect(() => {
    let cancelled = false;
    void host.startRun(missionId).then((init) => {
      if (!cancelled) dispatch({ type: "START", init });
    });
    return () => {
      cancelled = true;
    };
  }, [host, missionId]);

  useEffect(() => {
    let cancelled = false;
    void host.getBuddyAtlas().then((result) => {
      if (!cancelled) setAtlas(result);
    });
    return () => {
      cancelled = true;
    };
  }, [host]);

  useEffect(() => {
    bus.send({ type: "SET_REDUCED_MOTION", on: reducedMotion });
  }, [bus, reducedMotion]);

  useEffect(() => {
    const onVisibility = () => {
      if (document.visibilityState !== "visible") return;
      bus.send({
        type: "SETTLE",
        enemies: state.enemies,
        objective: state.objective,
      });
    };
    document.addEventListener("visibilitychange", onVisibility);
    return () => document.removeEventListener("visibilitychange", onVisibility);
  }, [bus, state.enemies, state.objective]);

  const stepKey = `${state.phase}:${state.roomIndex}:${state.questionIndex}`;

  useEffect(() => {
    if (!sceneReady || state.phase === "booting") return;
    if (handledRef.current === stepKey) return;
    handledRef.current = stepKey;

    const room = currentRoom(state);
    if (!room) return;

    const run = async () => {
      if (state.phase === "roomIntro") {
        await sendAndWait(
          bus,
          { type: "LOAD_ROOM", room, enemies: state.enemies, seed: state.seed },
          "ROOM_READY",
          INTRO_TIMEOUT,
        );
        await sendAndWait(bus, { type: "PLAY_INTRO" }, "INTRO_COMPLETE", INTRO_TIMEOUT);
        dispatch({ type: "INTRO_DONE" });
        return;
      }

      if (state.phase === "answering" && !state.question) {
        const question = await host.nextQuestion({
          runId: state.runId,
          roomId: room.id,
          action: state.pendingAction ?? "attack",
          band: state.band,
          history: state.history,
        });
        askedAtRef.current = Date.now();
        dispatch({ type: "QUESTION_READY", question });
        return;
      }

      if (state.phase === "playingMove") {
        const played = sendAndWait(
          bus,
          {
            type: "PLAY_PLAYER_MOVE",
            actionId: state.pendingAction ?? "attack",
            effectiveness: state.lastEffectiveness,
            countered: state.countered,
            assisted: state.assisted,
          },
          "MOVE_ANIMATION_COMPLETE",
          MOVE_TIMEOUT,
        );
        bus.send({ type: "SYNC_ENEMIES", enemies: state.enemies });
        bus.send({ type: "UPDATE_OBJECTIVE", progress: state.objective });
        await played;
        dispatch({ type: "MOVE_DONE" });
        return;
      }

      if (state.phase === "enemyTurn") {
        await sendAndWait(
          bus,
          {
            type: "PLAY_ENEMY_TURN",
            hit: !state.countered && state.lastEffectiveness <= 0.35,
            hazard: room.enemyIds.length === 0,
          },
          "ENEMY_TURN_COMPLETE",
          MOVE_TIMEOUT,
        );
        dispatch({ type: "ENEMY_DONE" });
        return;
      }

      if (state.phase === "roomOutro") {
        bus.send({ type: "ROOM_CLEARED" });
      }
    };

    void run();
  }, [bus, host, sceneReady, state, stepKey]);

  const answer = useCallback(
    (optionIndex: number | null) => {
      if (!state.question || state.phase !== "answering") return;
      const responseMs = Date.now() - askedAtRef.current;

      void host
        .submitAnswer({
          runId: state.runId,
          questionId: state.question.id,
          optionIndex,
          attemptNumber: state.attempt,
          hintLevel: state.hintLevel,
          responseMs,
        })
        .then((verdict) => dispatch({ type: "VERDICT", verdict, responseMs }));
    },
    [host, state.attempt, state.hintLevel, state.phase, state.question, state.runId],
  );

  const requestHint = useCallback(() => {
    if (!state.question) return;
    void host
      .requestHint(state.runId, state.question.id, state.hintLevel)
      .then((hint) => {
        if (hint) dispatch({ type: "HINT_READY", hint });
      });
  }, [host, state.hintLevel, state.question, state.runId]);

  const chooseAction = useCallback((action: ActionId) => {
    dispatch({ type: "CHOOSE_ACTION", action });
  }, []);

  const advance = useCallback(() => {
    dispatch({ type: "ADVANCE" });
  }, []);

  const recordedRef = useRef("");

  useEffect(() => {
    if (state.phase !== "runComplete" || !state.runId) return;
    if (recordedRef.current === state.runId) return;
    recordedRef.current = state.runId;

    void host.completeRun(state.runId, {
      missionId: state.missionId,
      roomsCleared: state.stats.roomsCleared,
      enemiesDefeated: state.stats.enemiesDefeated,
      questionsAnswered: state.stats.questionsAnswered,
      questionsCorrect: state.stats.questionsCorrect,
      perfectAnswers: state.stats.perfectAnswers,
      correctedAnswers: state.stats.correctedAnswers,
      heartsLeft: state.hearts,
    });
  }, [host, state.hearts, state.missionId, state.phase, state.runId, state.stats]);

  const markSceneReady = useCallback(() => setSceneReady(true), []);

  return {
    state,
    bus,
    ready: sceneReady,
    atlas,
    answer,
    requestHint,
    chooseAction,
    advance,
    setSceneReady: markSceneReady,
  };
}
