"use client";

import {
  BookOpenText,
  CircleCheck,
  CircleHelp,
  Clock,
  Globe,
  Lock,
  Mail,
  Plus,
  Star,
} from "lucide-react";
import { useState } from "react";
import {
  ArrivalHeader,
  ChapterRow,
  ChatBubble,
  ChatComposer,
  CourseCard,
  InteractiveCheck,
  QuizOption,
  StatTile,
  SubjectTile,
  TypingIndicator,
} from "@/components/domain";
import {
  AppBar,
  Avatar,
  Badge,
  Button,
  Card,
  Divider,
  EmptyState,
  IconButton,
  Input,
  ListGroup,
  ListRow,
  Logo,
  LogoMark,
  OtpInput,
  PasswordInput,
  ProgressBar,
  ProgressRing,
  Prose,
  RayBurst,
  RayRule,
  Screen,
  Section,
  Select,
  Sheet,
  Skeleton,
  Spinner,
  StepDots,
  Tabs,
  Text,
  Textarea,
  ToastProvider,
  useToast,
} from "@/components/ui";

const PALETTE = [
  ["Ultraviolet", "#5B3CE4", "Primary, links, key UI"],
  ["Cosmos Indigo", "#120C24", "Dark surfaces, hero grounds"],
  ["Lumen", "#C6F24C", "Earned progress. Never wallpaper."],
  ["Aura", "#ECE7FB", "Soft fills, selected, washes"],
  ["Paper", "#F4F3FA", "Default light background"],
  ["Ink", "#191325", "Body text on light"],
  ["Verdant", "#34D6B0", "Correct / complete"],
  ["Ember", "#FF6B6B", "Errors, destructive"],
] as const;

const RAYS = [
  ["Ray 1", "#A98BFF"],
  ["Ray 2", "#35C6DE"],
  ["Ray 3", "#34D6B0"],
  ["Ray 4", "#C6F24C"],
] as const;

function Block({
  title,
  note,
  children,
}: {
  title: string;
  note?: string;
  children: React.ReactNode;
}) {
  return (
    <Section title={title} ruled className="pt-2">
      {note && (
        <Text variant="caption" tone="muted" className="-mt-1">
          {note}
        </Text>
      )}
      <div className="space-y-3">{children}</div>
    </Section>
  );
}

function Gallery() {
  const toast = useToast();
  const [ground, setGround] = useState<"paper" | "cosmos">("paper");
  const [tab, setTab] = useState("linguistics");
  const [otp, setOtp] = useState("");
  const [sheet, setSheet] = useState(false);
  const [draft, setDraft] = useState("");
  const [recording, setRecording] = useState(false);
  const [picked, setPicked] = useState<number | null>(1);
  const [chosen, setChosen] = useState<string[]>(["History"]);

  return (
    <Screen ground={ground} wash className="mx-auto max-w-[26rem]">
      <AppBar
        title={<Logo size={26} ground={ground === "cosmos" ? "cosmos" : "light"} />}
        actions={
          <Button
            size="sm"
            variant="secondary"
            onClick={() => setGround((g) => (g === "paper" ? "cosmos" : "paper"))}
          >
            {ground === "paper" ? "Cosmos" : "Paper"}
          </Button>
        }
      />

      <div className="space-y-9 px-4 pb-24">
        <Text variant="caption" tone="subtle">
          {ground === "paper"
            ? "Paper — clarity. ~90% of screen time."
            : "Cosmos — arrival. Results, streaks, onboarding only."}
        </Text>

        <Block title="The mark" note="Clear space and the ≤32px reduction are enforced">
          <Card className="flex flex-wrap items-end gap-6">
            <Logo size={40} ground={ground === "cosmos" ? "cosmos" : "light"} />
            <LogoMark size={48} />
            <div className="text-center">
              <LogoMark size={28} />
              <Text variant="caption" tone="subtle">
                ≤32px
              </Text>
            </div>
          </Card>
        </Block>

        <Block title="Colour">
          <div className="grid grid-cols-2 gap-2">
            {PALETTE.map(([name, hex, use]) => (
              <Card key={name} padded={false} className="overflow-hidden">
                <span className="block h-11 w-full" style={{ background: hex }} />
                <span className="block p-3">
                  <Text variant="label">{name}</Text>
                  <Text variant="caption" tone="subtle" className="font-mono">
                    {hex}
                  </Text>
                  <Text variant="caption" tone="muted" className="mt-1 leading-tight">
                    {use}
                  </Text>
                </span>
              </Card>
            ))}
          </div>
        </Block>

        <Block title="The spectrum" note="Dividers, progress, empty-state art — nothing else">
          <div className="flex gap-1.5">
            {RAYS.map(([name, hex]) => (
              <span key={name} className="flex-1">
                <span className="block h-11 rounded-lg" style={{ background: hex }} />
                <Text variant="caption" tone="subtle" className="mt-1 font-mono text-[0.625rem]">
                  {hex}
                </Text>
              </span>
            ))}
          </div>
          <RayRule />
          <Divider variant="spectrum" label="section" />
          <ProgressBar value={68} tone="spectrum" size="md" />
        </Block>

        <Block title="Type" note="Fraunces to inspire, Hanken Grotesk to get things done">
          <Card className="space-y-3">
            <Text variant="display">What do you want to learn today?</Text>
            <Text variant="h2">A syllabus, built for one student</Text>
            <Text variant="h3">Understanding Morphology</Text>
            <Prose>
              <p>
                A morpheme is the smallest unit that carries meaning. &ldquo;Cat&rdquo; is
                one; &ldquo;cats&rdquo; is two.
              </p>
            </Prose>
            <Text variant="caption" tone="muted">
              Subject · Linguistics
            </Text>
          </Card>
        </Block>

        <Block title="Buttons">
          <Button fullWidth>Start Today&apos;s Lesson</Button>
          <Button fullWidth variant="secondary" leadingIcon={<BookOpenText size={18} />}>
            See Syllabus
          </Button>
          <Button fullWidth variant="accent">
            Syllabus unlocked
          </Button>
          <Button fullWidth variant="danger">
            Remove subject
          </Button>
          <div className="flex gap-2">
            <Button size="sm" variant="ghost">
              Skip
            </Button>
            <Button size="sm" loading>
              Saving
            </Button>
            <Button size="sm" disabled>
              Disabled
            </Button>
          </div>
          <div className="flex gap-2">
            <IconButton label="Add" icon={<Plus size={20} />} variant="filled" />
            <IconButton label="Browse" icon={<Globe size={20} />} variant="outline" />
            <IconButton label="Star" icon={<Star size={20} />} variant="plain" />
          </div>
        </Block>

        <Block title="Fields">
          <Input label="What is your name?" defaultValue="John Doe" />
          <Input
            label="Email"
            type="email"
            leadingIcon={<Mail size={18} />}
            defaultValue="not-an-email"
            error="Enter a valid email address."
          />
          <PasswordInput label="Password" leadingIcon={<Lock size={18} />} hint="At least 8 characters." />
          <Select
            label="Your Pronouns (optional)"
            defaultValue="he/him"
            options={[
              { value: "he/him", label: "he/him" },
              { value: "she/her", label: "she/her" },
              { value: "they/them", label: "they/them" },
            ]}
          />
          <Textarea label="Notes" placeholder="Anything you want the tutor to know" />
        </Block>

        <Block title="Verification code">
          <OtpInput value={otp} onChange={setOtp} onComplete={() => toast.show("Code approved", "success")} />
          <Text variant="caption" tone="muted" className="text-center">
            Didn&apos;t receive code?{" "}
            <button className="font-semibold text-brand" onClick={() => toast.show("Code sent")}>
              Request again
            </button>
          </Text>
        </Block>

        <Block title="Progress">
          <div className="flex items-center gap-5">
            <ProgressRing value={40} />
            <div className="flex-1 space-y-2 text-sm">
              <p className="flex justify-between">
                <span className="text-ink-muted">Total topics:</span>
                <span className="font-semibold tabular-nums text-ink">36</span>
              </p>
              <p className="flex justify-between">
                <span className="text-ink-muted">Completed:</span>
                <span className="font-semibold tabular-nums text-verdant-ink">12</span>
              </p>
              <p className="flex justify-between">
                <span className="text-ink-muted">Remaining:</span>
                <span className="font-semibold tabular-nums text-ink-subtle">24</span>
              </p>
            </div>
          </div>
          <ProgressRing value={72} tone="spectrum" size={104} />
          <ProgressBar value={45} tone="cosmos" size="md" />
          <StepDots total={5} current={2} className="justify-center" />
        </Block>

        <Block title="Badges, avatars, loading">
          <div className="flex flex-wrap items-center gap-2">
            <Badge tone="new">New</Badge>
            <Badge tone="brand">Intermediate</Badge>
            <Badge tone="success">Passed</Badge>
            <Badge tone="warning">Retry</Badge>
            <Badge tone="neutral">Draft</Badge>
            <Avatar name="John Doe" />
            <Avatar />
            <Spinner />
          </div>
          <Card>
            <Skeleton lines={3} />
          </Card>
        </Block>

        <Block title="Subject tabs">
          <Tabs
            className="px-0"
            value={tab}
            onChange={setTab}
            items={[
              { id: "linguistics", label: "Linguistics" },
              { id: "history", label: "History", flagged: true },
              { id: "philosophy", label: "Philosophy" },
            ]}
          />
        </Block>

        <Block title="Course card">
          <CourseCard
            subjectName="Linguistics"
            subjectIconName="translate"
            currentTopic="Understanding Morphology"
          />
          <CourseCard subjectName="Philosophy" subjectIconName="column" status="generating" />
          <CourseCard subjectName="History" subjectIconName="monument" status="awaiting_placement" />
        </Block>

        <Block title="Subject grid">
          <div className="grid grid-cols-2 gap-3">
            {[
              { name: "History", icon: "monument" },
              { name: "Science", icon: "flask" },
              { name: "Mathematics", icon: "sigma" },
              { name: "Linguistics", icon: "translate" },
            ].map((subject) => (
              <SubjectTile
                key={subject.name}
                name={subject.name}
                icon={subject.icon}
                selectable
                selected={chosen.includes(subject.name)}
                isNew={subject.name === "Science"}
                onClick={() =>
                  setChosen((current) =>
                    current.includes(subject.name)
                      ? current.filter((n) => n !== subject.name)
                      : [...current, subject.name],
                  )
                }
              />
            ))}
          </div>
        </Block>

        <Block title="Syllabus rows">
          <ChapterRow order={1} title="Introduction to Linguistics" percent={100} completed />
          <ChapterRow order={2} title="Sounds and Phonetics" percent={45} />
          <ChapterRow order={3} title="Understanding Morphology" percent={0} lessonStatus="generating" />
          <ChapterRow
            order={4}
            title="Syntax and Sentence Structure"
            percent={0}
            lessonStatus="failed"
            showConnector={false}
          />
        </Block>

        <Block title="Quiz">
          <Text variant="caption" tone="muted">
            Question 3 of 6
          </Text>
          <ProgressBar value={50} tone="cosmos" size="md" />
          {["Morpheme", "Phoneme", "Grapheme", "Lexeme"].map((option, index) => (
            <QuizOption
              key={option}
              label={option}
              state={picked === index ? "selected" : "idle"}
              onClick={() => setPicked(index)}
            />
          ))}
          <div className="grid grid-cols-2 gap-3">
            <StatTile icon={<CircleHelp size={18} />} value="06" label="Total questions" />
            <StatTile icon={<CircleCheck size={18} />} value="05" label="Correct answers" />
            <StatTile icon={<Star size={18} />} value="50" suffix="/60" label="Quiz score" />
            <StatTile icon={<Clock size={18} />} value="05 min" label="Quiz time" />
          </div>
        </Block>

        <Block title="Arrival moment" note="Cosmos only. Exactly one Lumen element.">
          <Card padded={false} className="overflow-hidden">
            <div data-ground="cosmos" className="relative bg-cosmos py-8">
              <ArrivalHeader
                title="Your syllabus is ready"
                subtitle="You placed into intermediate Linguistics. Six chapters, starting with morphology."
                highlight="Placement complete"
              />
            </div>
          </Card>
        </Block>

        <Block title="Inline practice">
          <InteractiveCheck
            id="demo-tf"
            kind="true_false"
            prompt="The speech sounds [p], [b], and [m] are all bilabial consonants."
            options={["True", "False"]}
            onCheck={async (answer) => ({
              correct: answer[0] === 0,
              correctAnswer: [0],
              explanation:
                "True. All three are produced by bringing both lips together — they differ in voicing and nasality, not place.",
            })}
          />
          <InteractiveCheck
            id="demo-order"
            kind="drag_drop"
            prompt="Order these sounds from the front of the mouth to the back."
            options={["[k] velar", "[p] bilabial", "[t] alveolar"]}
            onCheck={async (answer) => ({
              correct: answer.join() === [1, 2, 0].join(),
              correctAnswer: [1, 2, 0],
              explanation: "Bilabial is frontmost, then alveolar, then velar.",
            })}
          />
        </Block>

        <Block title="Tutor chat">
          <Card className="space-y-4">
            <ChatBubble role="user" timestamp="Thursday 2:14 PM">
              Define the theory of evolution and tell me step by step about its origin.
            </ChatBubble>
            <ChatBubble role="assistant">
              The theory of evolution is the scientific explanation that all living species
              change over time through changes in inheritable genetic traits across
              successive generations.
            </ChatBubble>
            <TypingIndicator />
          </Card>
          <ChatComposer
            value={draft}
            onChange={setDraft}
            onSend={() => {
              toast.show("Sent");
              setDraft("");
            }}
            onAttach={() => setSheet(true)}
            onStartVoice={() => setRecording(true)}
            onStopVoice={() => setRecording(false)}
            recording={recording}
          />
        </Block>

        <Block title="Settings rows">
          <ListGroup>
            <ListRow icon={<Mail size={18} />} label="Email" onClick={() => {}} />
            <ListRow icon={<Lock size={18} />} label="Password & Security" onClick={() => {}} />
            <ListRow icon={<Globe size={18} />} label="Language" value="English" onClick={() => {}} />
            <ListRow label="French" selected showChevron={false} onClick={() => {}} />
          </ListGroup>
        </Block>

        <Block title="Empty state" note="Spectrum burst, not a generic icon">
          <Card padded={false}>
            <EmptyState
              title="No subjects yet"
              description="Add a subject and we'll build a syllabus around what you already know."
              action={
                <Button size="md" onClick={() => setSheet(true)}>
                  Add a subject
                </Button>
              }
            />
          </Card>
          <div className="flex gap-2">
            <Button size="sm" variant="secondary" onClick={() => toast.show("Saved", "success")}>
              Success toast
            </Button>
            <Button size="sm" variant="secondary" onClick={() => toast.show("Couldn't save", "error")}>
              Error toast
            </Button>
          </div>
          <RayBurst size={72} className="mx-auto" />
        </Block>
      </div>

      <Sheet open={sheet} onClose={() => setSheet(false)} title="Add a subject">
        <div className="grid grid-cols-2 gap-3 pt-2">
          {[
            { name: "Painting", icon: "palette" },
            { name: "Filmmaking", icon: "clapperboard" },
          ].map((subject) => (
            <SubjectTile key={subject.name} name={subject.name} icon={subject.icon} />
          ))}
        </div>
      </Sheet>
    </Screen>
  );
}

export default function DesignSystemPage() {
  return (
    <ToastProvider>
      <Gallery />
    </ToastProvider>
  );
}
