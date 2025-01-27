import { defineConfig } from "vite";
import eslint from "vite-plugin-eslint";

export default defineConfig({
	plugins: [eslint()],
	server: { host: "192.168.1.149" },
});
