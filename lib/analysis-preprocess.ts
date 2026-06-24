export function preprocessTranscript(transcript: string) {
  return transcript
    .split("\n")
    .map((line) => line.trim())
    .filter((line) => {
      if (!line) {
        return false;
      }

      if (/^\d+$/.test(line)) {
        return false;
      }

      if (/^\d{2}:\d{2}:\d{2},\d{3}\s+-->\s+\d{2}:\d{2}:\d{2},\d{3}$/.test(line)) {
        return false;
      }

      return true;
    })
    .join(" ")
    .replace(/\s+/g, " ")
    .trim();
}

export function buildTimedTranscript(transcript: string) {
  const cues = parseSrtCues(transcript);

  if (cues.length === 0) {
    return preprocessTranscript(transcript);
  }

  return cues
    .map((cue) => `[${cue.start}-${cue.end}] ${cue.text}`)
    .join("\n");
}

export function preprocessComments(commentsRaw: string) {
  const seen = new Set<string>();

  return commentsRaw
    .split("\n")
    .map((comment) => comment.trim())
    .filter(Boolean)
    .filter((comment) => !shouldDropComment(comment))
    .filter((comment) => {
      const key = comment.toLowerCase();
      if (seen.has(key)) {
        return false;
      }
      seen.add(key);
      return true;
    })
    .slice(0, 150);
}

function parseSrtCues(transcript: string) {
  const blocks = transcript.split(/\n\s*\n/);
  const cues: Array<{ start: string; end: string; text: string }> = [];

  for (const block of blocks) {
    const lines = block
      .split("\n")
      .map((line) => line.trim())
      .filter(Boolean);

    if (lines.length < 2) {
      continue;
    }

    const timecodeLine = lines.find((line) => line.includes("-->"));
    if (!timecodeLine) {
      continue;
    }

    const match = timecodeLine.match(
      /(\d{2}:\d{2}:\d{2}),\d{3}\s+-->\s+(\d{2}:\d{2}:\d{2}),\d{3}/
    );

    if (!match) {
      continue;
    }

    const text = lines
      .filter((line) => line !== timecodeLine && !/^\d+$/.test(line))
      .join(" ")
      .replace(/\s+/g, " ")
      .trim();

    if (!text) {
      continue;
    }

    cues.push({
      start: match[1],
      end: match[2],
      text
    });
  }

  return cues;
}

function shouldDropComment(comment: string) {
  const lower = comment.toLowerCase();

  if (/https?:\/\/|www\./i.test(comment)) {
    return true;
  }

  if (
    /(blog post|product links|related video|follow josh|recommended products|video production equipment)/i.test(
      lower
    )
  ) {
    return true;
  }

  if (/^[\p{Emoji_Presentation}\p{Extended_Pictographic}👉🔗🛒📑🎥👋].*:/u.test(comment)) {
    return true;
  }

  if (comment.length < 2) {
    return true;
  }

  return false;
}
