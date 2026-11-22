import { AnchorPortrait } from "@/components/anchor-portrait";
import { Badge, Card, PageHeader, tones } from "@/components/ui";
import { connection } from "next/server";
import { accent, anchors, resolveAnchor } from "@/lib/anchors";

export default async function ProfilePage({ params }: PageProps<"/[anchor]/profile">) {
  const id = await resolveAnchor(params);
  // Rendered per request so a portrait dropped into public/anchors shows up without a rebuild.
  await connection();
  const a = anchors[id];
  const other = anchors[id === "reema" ? "siddharth" : "reema"];
  const tone = tones[accent[id].tone];

  return (
    <>
      <PageHeader eyebrow={a.name} tone={accent[id].tone} title="Profile" description="Who the anchor is, how they sound, and the lines they won't cross." />

      <div className="grid gap-6 lg:grid-cols-[360px_1fr]">
        <div>
          <AnchorPortrait id={id} size="lg" className={`border border-white/10 ${tone.glow}`} />
          <p className="mt-3 text-center text-xs text-slate-500">
            AI-generated character. Not based on, or a likeness of, any real person.
          </p>
        </div>

        <div className="space-y-4">
          <Card className={`border-l-4 ${accent[id].border} ${accent[id].soft}`}>
            <h2 className={`text-3xl font-semibold ${accent[id].text}`}>{a.name}</h2>
            <p className="mt-1 text-sm font-medium uppercase tracking-wider text-slate-300">{a.role}</p>
            <p className="mt-4 text-xl italic text-white">&ldquo;{a.tagline}&rdquo;</p>
            <p className="mt-4 text-sm leading-relaxed text-slate-200">{a.bio}</p>
          </Card>

          <div className="grid gap-4 md:grid-cols-2">
            <Card title="Worldview">
              <p className="text-sm text-slate-200">{a.worldview}</p>
              <div className="mt-3 flex flex-wrap gap-1.5">
                {a.focus.map((f) => (
                  <Badge key={f} className={tone.chip}>
                    {f}
                  </Badge>
                ))}
              </div>
            </Card>
            <Card title="Voice & delivery">
              <p className="text-sm text-slate-200">{a.delivery}</p>
            </Card>
            <Card title="Comedy">
              <p className="text-sm text-slate-200">{a.comedy}</p>
            </Card>
            <Card title="Look & set">
              <p className="text-sm text-slate-200">{a.look}</p>
              <p className="mt-2 text-sm text-slate-400">{a.set}</p>
            </Card>
            <Card title="Catchphrases">
              <ul className="space-y-1.5 text-sm text-slate-200">
                {a.catchphrases.map((c) => (
                  <li key={c}>&ldquo;{c}&rdquo;</li>
                ))}
              </ul>
              <p className="mt-3 text-xs text-slate-400">
                Sign-off: <span className="text-slate-200">&ldquo;{a.signOff}&rdquo;</span>
              </p>
            </Card>
            <Card title="Never does">
              <ul className="list-disc space-y-1.5 pl-5 text-sm text-slate-200">
                {a.neverDoes.map((n) => (
                  <li key={n}>{n}</li>
                ))}
              </ul>
              <p className="mt-3 text-xs text-slate-400">
                Concedes a point to {other.name} or roasts their own side at least once a day.
              </p>
            </Card>
          </div>
        </div>
      </div>
    </>
  );
}
