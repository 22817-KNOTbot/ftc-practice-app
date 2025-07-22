package com.knotbot.practiceapp;

import com.qualcomm.ftccommon.FtcEventLoop;
import com.qualcomm.robotcore.util.RobotLog;
import com.qualcomm.robotcore.util.WebHandlerManager;
import com.qualcomm.robotcore.eventloop.opmode.OpModeManagerImpl;

import org.firstinspires.ftc.ftccommon.external.OnCreateEventLoop;
import org.firstinspires.ftc.ftccommon.external.OnCreate;
import org.firstinspires.ftc.ftccommon.external.WebHandlerRegistrar;

import org.firstinspires.ftc.robotcore.internal.system.AppUtil;
import org.firstinspires.ftc.robotcore.internal.webserver.WebHandler;

import org.firstinspires.ftc.robotserver.internal.webserver.MimeTypesUtil;

import com.squareup.moshi.Moshi;
import com.squareup.moshi.JsonAdapter;
import com.squareup.moshi.JsonDataException;

import fi.iki.elonen.NanoHTTPD;
import fi.iki.elonen.NanoWSD;

import android.app.Activity;
import android.content.Context;
import android.content.res.AssetManager;
import android.util.Log;

import java.io.File;
import java.io.FileInputStream;
import java.io.IOException;

public class PracticeApp {
	private static final String TAG = "PracticeApp";
	private static final String WEB_PATH = "/practice";

	protected static PracticeApp instance;
	private static WebHandlerManager manager;

	private PracticeApp() {
		try {
			wsServer.start(0);
		} catch (Exception err) {
			Log.e(TAG, "Error starting WS Server", err);
		}
	}

	@OnCreate
	public static void start(Context context) {
		if (instance == null) instance = new PracticeApp();
		if (RobotEvent.instance == null) RobotEvent.instance = new RobotEvent();
		Log.i(TAG, "STARTED");
	}

	@OnCreateEventLoop
	public static void registerOpModeNotifications(Context context, FtcEventLoop eventLoop) {
		OpModeManagerImpl opModeManager = eventLoop.getOpModeManager();
		if (RobotEvent.opModeManager != null) {
			opModeManager.unregisterListener(RobotEvent.instance);
		}
		RobotEvent.opModeManager = opModeManager;
		
		if (RobotEvent.opModeManager != null) {
			opModeManager.registerListener(RobotEvent.instance);
		}
	}

	/*
	 * HTTP
	 */

	@WebHandlerRegistrar
	public static void registerWebHandler(Context context, WebHandlerManager manager) {
		if (instance != null && manager != null) {
			PracticeApp.manager = manager;
			instance.attachWebHandler(manager);
			instance.attachAssetWebHandlers(manager, "practice/assets");
			instance.attachDataWebHandlers(manager);
		}
	}

	private void attachWebHandler(WebHandlerManager manager) {
		manager.register(WEB_PATH, createWebHandler("practice/index.html"));
		manager.register(WEB_PATH + "/stats", createWebHandler("practice/stats.html"));
	}

	private void attachAssetWebHandlers(WebHandlerManager manager, String path) {
		try {
			AssetManager assetManager = AppUtil.getInstance().getActivity().getAssets();
			String[] pathList = assetManager.list(path);
			
			if (pathList == null) {
				return;
			}

			if (pathList.length > 0) {
				for (String file : pathList) {
					attachAssetWebHandlers(manager, path + "/" + file);
				}
			} else {
				manager.register(WEB_PATH + "/" + path, createWebHandler(path));
			}
		} catch (Exception err) {
			Log.e(TAG, "Error attaching asset web handlers", err);
		}
	}

	private void attachDataWebHandlers(WebHandlerManager manager) {
		try {
			File dataPath = new File(AppUtil.ROOT_FOLDER, "Practice/data");
			if (!dataPath.exists()) {
				dataPath.mkdirs();
			}
			
			File[] fileList = dataPath.listFiles();
			
			if (fileList == null || fileList.length <= 0) {
				return;
			}

			for (File file : fileList) {
				manager.register(WEB_PATH + "/data/" + file.getName(), createDataWebHandler(file.getAbsolutePath()));
			}
		} catch (Exception err) {
			Log.e(TAG, "Error attaching data web handlers", err);
		}
	}

	protected void attachDataWebHandler(File file) {
		if (manager == null) return;
		try {
			if (!file.exists() || !file.isFile()) {
				Log.w(TAG, "Data file not found. Path: " + file.getAbsolutePath());
				return;
			}

			PracticeApp.manager.register(WEB_PATH + "/data/" + file.getName(), createDataWebHandler(file.getAbsolutePath()));
		} catch (Exception err) {
			Log.e(TAG, "Error attaching data web handler \"" + file.getAbsolutePath() + "\"", err);
		}
	}

	private WebHandler createWebHandler(String file) {
		Log.d(TAG, "Created WebHandler \"" + file + "\"");
		return new WebHandler() {
			@Override
			public NanoHTTPD.Response getResponse(NanoHTTPD.IHTTPSession session) throws IOException {
				if (session.getMethod() == NanoHTTPD.Method.GET) {
					AssetManager assetManager = AppUtil.getInstance().getActivity().getAssets();
					String mimeType = MimeTypesUtil.determineMimeType(file);
					Log.d(TAG, "WebHandler returned file \"" + file + "\"");
					return NanoHTTPD.newChunkedResponse(NanoHTTPD.Response.Status.OK, mimeType, assetManager.open(file));
				} else {
					return NanoHTTPD.newFixedLengthResponse(NanoHTTPD.Response.Status.NOT_FOUND, NanoHTTPD.MIME_PLAINTEXT, "");
				}
			}
		};
	}
	
	private WebHandler createDataWebHandler(String file) {
		Log.d(TAG, "Created WebHandler \"" + file + "\"");
		return new WebHandler() {
			@Override
			public NanoHTTPD.Response getResponse(NanoHTTPD.IHTTPSession session) throws IOException {
				if (session.getMethod() == NanoHTTPD.Method.GET) {
					String mimeType = MimeTypesUtil.determineMimeType(file);
					Log.d(TAG, "WebHandler returned file \"" + file + "\"");
					return NanoHTTPD.newChunkedResponse(NanoHTTPD.Response.Status.OK, mimeType, new FileInputStream(file));
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

		public Message(String event, String name, Integer value) {
			this.event = event;
			this.name = name;
			this.value = value;
		}

		public String toJson() {
			Moshi moshi = new Moshi.Builder().build();
			JsonAdapter<Message> jsonAdapter = moshi.adapter(Message.class);

			String json = jsonAdapter.toJson(this);
			return json;
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
			Log.d(TAG, "WS Opened");
		}

		public void onClose() {
			this.socket = null;
			RobotEvent.unregisterWsHandler();
			open = false;
			Log.d(TAG, "WS Closed");
		}

		public void onMessage(String json) {
			Log.d(TAG, "Received WS message \"" + json + "\"");
			Moshi moshi = new Moshi.Builder().build();
			JsonAdapter<Message> jsonAdapter = moshi.adapter(Message.class);

			Message message;
			try {
				message = jsonAdapter.fromJson(json);
				// Log.v(TAG, runData.toString());
			} catch (IOException | JsonDataException err) {
				Log.e(TAG, "Error deserializing JSON", err);
				return;
			}

			if (message == null) return;

			switch (message.event) {
				case "saveRun":
					if (message.name == null || message.value == null) {
						Log.e(TAG, "Malformed save run message. Given data \"" + json + "\"");
						return;
					}
					if (message.name == "" || RobotEvent.runData == null) return;
					RobotEvent.runData.name = message.name;
					RobotEvent.runData.timestamp = message.value;
					DataStorage.saveRun(RobotEvent.runData);
					break;
				default:
					break;
			}

			// Dev code to echo sent WS messages
			if (json.startsWith("~")) {
				try {
					socket.send(json.substring(1));
				} catch (Exception e) {}
			}
		}

		public void sendMessage(Message message) {
			socket.send(message);
		}
	}

	private NanoWSD wsServer = new NanoWSD(8001) {
		@Override
		protected NanoWSD.WebSocket openWebSocket(NanoHTTPD.IHTTPSession handshake) {
			return new Socket(handshake);
		}
	};
}
