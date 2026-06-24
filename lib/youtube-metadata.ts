export type YouTubeMetadata = {
  videoId: string;
  title: string;
  channelTitle: string;
  views: number | undefined;
  likes: number | undefined;
  commentsCount: number | undefined;
};

export type YouTubeCommentsResult = {
  videoId: string;
  comments: string[];
  fetchedCount: number;
};

export function extractYouTubeVideoId(url: string) {
  const trimmedUrl = url.trim();

  if (!trimmedUrl) {
    return null;
  }

  try {
    const parsedUrl = new URL(trimmedUrl);
    const host = parsedUrl.hostname.replace(/^www\./, "");

    if (host === "youtu.be") {
      return parsedUrl.pathname.split("/").filter(Boolean)[0] ?? null;
    }

    if (host === "youtube.com" || host === "m.youtube.com" || host === "music.youtube.com") {
      if (parsedUrl.pathname === "/watch") {
        return parsedUrl.searchParams.get("v");
      }

      const pathParts = parsedUrl.pathname.split("/").filter(Boolean);
      const supportedPath = ["shorts", "embed", "live"].includes(pathParts[0]);

      if (supportedPath) {
        return pathParts[1] ?? null;
      }
    }
  } catch {
    return null;
  }

  return null;
}

export async function fetchYouTubeMetadata(videoUrl: string): Promise<YouTubeMetadata> {
  const apiKey = process.env.YOUTUBE_API_KEY;

  if (!apiKey) {
    throw new Error("YOUTUBE_API_KEY is not configured.");
  }

  const videoId = extractYouTubeVideoId(videoUrl);

  if (!videoId) {
    throw new Error("The URL does not look like a supported YouTube video link.");
  }

  const requestUrl = new URL("https://www.googleapis.com/youtube/v3/videos");
  requestUrl.searchParams.set("part", "snippet,statistics");
  requestUrl.searchParams.set("id", videoId);
  requestUrl.searchParams.set("key", apiKey);

  const response = await fetch(requestUrl);
  const payload = await response.json();

  if (!response.ok) {
    const message =
      payload?.error?.message ??
      "YouTube returned an error while fetching video metadata.";
    throw new Error(message);
  }

  const item = payload?.items?.[0];

  if (!item) {
    throw new Error("No public YouTube video was found for this link.");
  }

  return {
    videoId,
    title: item.snippet?.title ?? "",
    channelTitle: item.snippet?.channelTitle ?? "",
    views: parseOptionalCount(item.statistics?.viewCount),
    likes: parseOptionalCount(item.statistics?.likeCount),
    commentsCount: parseOptionalCount(item.statistics?.commentCount)
  };
}

export async function fetchYouTubeComments(
  videoUrl: string,
  maxComments = 100
): Promise<YouTubeCommentsResult> {
  const apiKey = process.env.YOUTUBE_API_KEY;

  if (!apiKey) {
    throw new Error("YOUTUBE_API_KEY is not configured.");
  }

  const videoId = extractYouTubeVideoId(videoUrl);

  if (!videoId) {
    throw new Error("The URL does not look like a supported YouTube video link.");
  }

  const comments: string[] = [];
  let pageToken: string | undefined;
  const safeMaxComments = Math.min(Math.max(maxComments, 1), 300);

  while (comments.length < safeMaxComments) {
    const requestUrl = new URL("https://www.googleapis.com/youtube/v3/commentThreads");
    requestUrl.searchParams.set("part", "snippet");
    requestUrl.searchParams.set("videoId", videoId);
    requestUrl.searchParams.set("order", "relevance");
    requestUrl.searchParams.set("textFormat", "plainText");
    requestUrl.searchParams.set("maxResults", String(Math.min(100, safeMaxComments - comments.length)));
    requestUrl.searchParams.set("key", apiKey);

    if (pageToken) {
      requestUrl.searchParams.set("pageToken", pageToken);
    }

    const response = await fetch(requestUrl);
    const payload = await response.json();

    if (!response.ok) {
      const message =
        payload?.error?.message ??
        "YouTube returned an error while fetching comments.";
      throw new Error(message);
    }

    for (const item of payload?.items ?? []) {
      const text = item?.snippet?.topLevelComment?.snippet?.textDisplay;

      if (typeof text === "string" && text.trim()) {
        comments.push(cleanCommentText(text));
      }
    }

    pageToken = payload?.nextPageToken;

    if (!pageToken) {
      break;
    }
  }

  return {
    videoId,
    comments,
    fetchedCount: comments.length
  };
}

function parseOptionalCount(value: unknown) {
  if (typeof value !== "string") {
    return undefined;
  }

  const parsed = Number(value);

  return Number.isFinite(parsed) ? parsed : undefined;
}

function cleanCommentText(value: string) {
  return value.replace(/\s+/g, " ").trim();
}
