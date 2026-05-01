export default function youtubeUrlToEmbed(urlString) {
	const template = (v) => `https://www.youtube.com/embed/${v}`;
	if (urlString && URL.canParse(urlString)) {
		const url = new URL(urlString);
		if (url.hostname === "www.youtu.be" || url.hostname === "youtu.be") {
			return template(
				url.pathname.startsWith("/") ? url.pathname.substring(1) : url.pathname,
			);
		}
		const v = url.searchParams.get("v");
		if (
			(url.hostname === "www.youtube.com" || url.hostname === "youtube.com") &&
			v
		) {
			return template(v);
		}
	}
	return urlString;
}
