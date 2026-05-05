import { generateObject } from "ai";
import { gateway } from "@ai-sdk/gateway";
import { Detection, ScoutInput } from "@/lib/ipm/schemas";
import { buildMaizePrompt } from "@/lib/vision/prompts/maize";

function buildSystemPrompt(input: ScoutInput): string {
  const crop = input.crop.toLowerCase();
  if (crop === "maize" || crop === "corn") {
    return buildMaizePrompt(input.growth_stage_observed);
  }
  throw new Error(`No prompt defined for crop: ${input.crop}`);
}

function truncateReasoning(raw: string): string {
  if (raw.length <= 200) return raw;
  return raw.slice(0, 197) + "...";
}

function needsEscalation(det: Detection): boolean {
  if (det.confidence_0_1 < 0.7) return true;
  const highConfCandidates = det.candidates.filter((c) => c.confidence_0_1 > 0.5);
  if (highConfCandidates.length >= 2) return true;
  return false;
}

export async function identify(input: ScoutInput): Promise<Detection> {
  const system = buildSystemPrompt(input);
  const messages: Parameters<typeof generateObject>[0]["messages"] = [
    {
      role: "user",
      content: [{ type: "image", image: input.image_url }],
    },
  ];

  const sonnetResult = await generateObject({
    model: gateway("anthropic/claude-sonnet-4-6"),
    schema: Detection,
    system,
    messages,
    temperature: 0,
  });

  const sonnet = {
    ...sonnetResult.object,
    reasoning: truncateReasoning(sonnetResult.object.reasoning),
  };

  if (!needsEscalation(sonnet)) {
    return sonnet;
  }

  const opusResult = await generateObject({
    model: gateway("anthropic/claude-opus-4-7"),
    schema: Detection,
    system,
    messages,
    temperature: 0,
  });

  return {
    ...opusResult.object,
    reasoning: truncateReasoning(opusResult.object.reasoning),
  };
}
