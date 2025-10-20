import { defineConfig } from "vite";
import eslint from "vite-plugin-eslint";

export default defineConfig({
	plugins: [eslint()],
	// server: { host: "192.168.1.79" },
	// Disable hash in file name
	base: "/practice/",
	build: {
		rollupOptions: {
			input: {
				index: "./index.html",
				stats: "./stats.html",
				settings: "./settings.html",
				about: "./about.html",
			},
			output: {
				entryFileNames: `assets/[name].js`,
				chunkFileNames: `assets/[name].js`,
				assetFileNames: `assets/[name].[ext]`,
			},
		},
	},
});
