package com.knotbot.practiceapp;

import com.qualcomm.robotcore.util.RobotLog;
import com.qualcomm.robotcore.util.WebHandlerManager;

import org.firstinspires.ftc.ftccommon.external.OnCreate;
import org.firstinspires.ftc.ftccommon.external.WebHandlerRegistrar;

import org.firstinspires.ftc.robotcore.internal.system.AppUtil;
import org.firstinspires.ftc.robotcore.internal.webserver.WebHandler;

import org.firstinspires.ftc.robotserver.internal.webserver.MimeTypesUtil;

import fi.iki.elonen.NanoHTTPD;
import fi.iki.elonen.NanoWSD;

import android.app.Activity;
import android.content.Context;
import android.content.res.AssetManager;

import java.io.IOException;

public class PracticeApp {
	private static final String WEB_PATH = "/practice";

	private static PracticeApp instance;

	@OnCreate
	public static void start(Context context) {
		if (instance == null) instance = new PracticeApp();
	}

	/*
	 * HTTP
	 */

	@WebHandlerRegistrar
	public static void registerWebHandler(Context context, WebHandlerManager manager) {
		if (instance != null && manager != null) {
			instance.attachWebHandler(manager);
		}
	}

	private void attachWebHandler(WebHandlerManager manager) {
		WebHandler webHandler = createWebHandler("practice/index.html");
		manager.register(WEB_PATH, webHandler);
	}

	private WebHandler createWebHandler(String file) {
		return new WebHandler() {
			@Override
			public NanoHTTPD.Response getResponse(NanoHTTPD.IHTTPSession session) throws IOException {
				if (session.getMethod() == NanoHTTPD.Method.GET) {
					AssetManager assetManager = AppUtil.getInstance().getActivity().getAssets();
					String mimeType = MimeTypesUtil.determineMimeType(file);
					return NanoHTTPD.newChunkedResponse(NanoHTTPD.Response.Status.OK, mimeType, assetManager.open(file));
				} else {
					return NanoHTTPD.newFixedLengthResponse(NanoHTTPD.Response.Status.NOT_FOUND, NanoHTTPD.MIME_PLAINTEXT, "");
				}
			}
		};
	}

	/*
	 * Web socket
	 */
	
	public static class Message {
		public String event;
		public String name;
		public Integer value;

		public Message(String event) {
			this.event = event;
		}

		public Message(String event, String name) {
			this.event = event;
			this.name = name;
		}

		public Message(String event, Integer value) {
			this.event = event;
			this.value = value;
		}

		public String toJson() {
			if (name == null && value == null) {
				return String.format("{\"event\":\"%s\"}", event);
			} else if (name != null) {
				return String.format("{\"event\":\"%s\", \"name\":\"%s\"}", event, name);
			} else if (value != null) {
				return String.format("{\"event\":\"%s\", \"value\":\"%d\"}", event, value);
			} else {
				return "{\"event\":\"error\", \"name\":\"An illegal message was constructed\"}";
			}
		}
	}

	private class Socket extends NanoWSD.WebSocket {
		WsHandler wsHandler;

		public Socket(NanoHTTPD.IHTTPSession handshake) {
			super(handshake);
			wsHandler = new WsHandler();
			wsHandler.register(this);
		}

		@Override
		protected void onOpen() {
			wsHandler.onOpen();
		}

		@Override
		protected void onClose(NanoWSD.WebSocketFrame.CloseCode code, String reason, boolean initiatedByRemote) {
			wsHandler.onClose();
		}

		@Override
		protected void onMessage(NanoWSD.WebSocketFrame message) {
			String messageStr = message.getTextPayload();
			wsHandler.onMessage(messageStr);
		}

		@Override
		protected void onPong(NanoWSD.WebSocketFrame pong) {}

		@Override
		protected void onException(IOException exception) {}

		public void send(Message message) {
			String messageStr = message.toJson();
			try {
				send(messageStr);
			} catch (IOException err) {
				RobotLog.logStackTrace(err);
			}
		}
	}

	protected class WsHandler {
		private Socket socket;
		private boolean open = false;

		public void register(Socket socket) {
			this.socket = socket;
			RobotEvent.registerWsHandler(this);
		}

		public void onOpen() {
			open = true;
		}

		public void onClose() {
			this.socket = null;
			open = false;
		}

		public void onMessage(String message) {
			// TODO: parse JSON and handle message
		}

		public void sendMessage(Message message) {
			socket.send(message);
		}
	}

	private NanoWSD wsServer = new NanoWSD(80) {
        @Override
        protected NanoWSD.WebSocket openWebSocket(NanoHTTPD.IHTTPSession handshake) {
            return new Socket(handshake);
        }
    };
}
