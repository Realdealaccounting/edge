/* global React, useTweaks, TweaksPanel, TweakSection, TweakColor, TweakRadio, TweakToggle */
const EDGE_TWEAK_DEFAULTS = /*EDITMODE-BEGIN*/{
  "accent": ["#2E1059", "#230C45", "#6D45C9"],
  "headingFont": "Manrope",
  "corners": "rounded",
  "motion": true
}/*EDITMODE-END*/;

const HEADING_STACKS = {
  "Manrope": '"Manrope", sans-serif',
  "Sora": '"Sora", sans-serif',
  "Jakarta": '"Plus Jakarta Sans", sans-serif'
};

function EdgeTweaks() {
  const [t, setTweak] = useTweaks(EDGE_TWEAK_DEFAULTS);

  React.useEffect(() => {
    const root = document.documentElement;
    const a = Array.isArray(t.accent) ? t.accent : [t.accent, t.accent, t.accent];
    root.style.setProperty("--emerald", a[0]);
    root.style.setProperty("--emerald-600", a[1] || a[0]);
    root.style.setProperty("--emerald-300", a[2] || a[0]);
  }, [t.accent]);

  React.useEffect(() => {
    document.documentElement.style.setProperty("--font-display", HEADING_STACKS[t.headingFont] || HEADING_STACKS.Manrope);
  }, [t.headingFont]);

  React.useEffect(() => {
    document.body.classList.toggle("sharp", t.corners === "sharp");
  }, [t.corners]);

  React.useEffect(() => {
    document.body.classList.toggle("no-motion", !t.motion);
  }, [t.motion]);

  return (
    <TweaksPanel title="Tweaks">
      <TweakSection label="Brand accent" />
      <TweakColor
        label="Accent color"
        value={t.accent}
        options={[
          ["#2E1059", "#230C45", "#6D45C9"],
          ["#3B1576", "#2E1059", "#8B5CF6"],
          ["#1F0A3D", "#160730", "#5B3CA8"],
          ["#23215C", "#191843", "#6366F1"]
        ]}
        onChange={(v) => setTweak("accent", v)}
      />
      <TweakSection label="Typography" />
      <TweakRadio
        label="Heading font"
        value={t.headingFont}
        options={["Manrope", "Sora", "Jakarta"]}
        onChange={(v) => setTweak("headingFont", v)}
      />
      <TweakSection label="Style" />
      <TweakRadio
        label="Corners"
        value={t.corners}
        options={["rounded", "sharp"]}
        onChange={(v) => setTweak("corners", v)}
      />
      <TweakToggle
        label="Motion &amp; animation"
        value={t.motion}
        onChange={(v) => setTweak("motion", v)}
      />
    </TweaksPanel>
  );
}

ReactDOM.createRoot(document.getElementById("tweaks-root")).render(<EdgeTweaks />);
