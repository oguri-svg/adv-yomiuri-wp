export const humanFileSize = (bytes, decimals = 2) => {
	const sizes = ["B", "KB", "MB", "GB", "TB", "PB"];
	if (bytes === 0) return "0B";

	const factor = Math.floor(Math.log10(bytes) / 3);
	const size = sizes[factor] || "B";

	return `${(bytes / Math.pow(1024, factor)).toFixed(decimals)}${size}`;
};
