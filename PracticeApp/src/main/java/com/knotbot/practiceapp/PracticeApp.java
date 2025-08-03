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
import java.util.Arrays;
import java.util.HashSet;
import java.util.Iterator;
import java.util.List;
import java.util.Set;

public class PracticeApp {
	private static final String TAG = "PracticeApp";
	private static final String WEB_PATH = "/practice";
	private static final Set<String> DISALLOWED_DELETE_FILES = new HashSet<>(Arrays.asList(
		"main.json",
		"unsaved.json"
	));

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
			instance.attachDeleteHandler(manager);
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

	private void attachDeleteHandler(WebHandlerManager manager) {
		manager.register(WEB_PATH + "/data/delete", createDeleteHandler(new File(AppUtil.ROOT_FOLDER, "Practice/data")));
	}

	private WebHandler createWebHandler(String file) {
		Log.v(TAG, "Created WebHandler \"" + file + "\"");
		return new WebHandler() {
			@Override
			public NanoHTTPD.Response getResponse(NanoHTTPD.IHTTPSession session) throws IOException {
				if (session.getMethod() == NanoHTTPD.Method.GET) {
					AssetManager assetManager = AppUtil.getInstance().getActivity().getAssets();
					String mimeType = MimeTypesUtil.determineMimeType(file);
					Log.v(TAG, "WebHandler returned file \"" + file + "\"");
					return NanoHTTPD.newChunkedResponse(NanoHTTPD.Response.Status.OK, mimeType, assetManager.open(file));
				} else {
					return NanoHTTPD.newFixedLengthResponse(NanoHTTPD.Response.Status.NOT_FOUND, NanoHTTPD.MIME_PLAINTEXT, "");
				}
			}
		};
	}
	
	private WebHandler createDataWebHandler(String file) {
		Log.v(TAG, "Created WebHandler \"" + file + "\"");
		return new WebHandler() {
			@Override
			public NanoHTTPD.Response getResponse(NanoHTTPD.IHTTPSession session) throws IOException {
				if (session.getMethod() == NanoHTTPD.Method.GET) {
					String mimeType = MimeTypesUtil.determineMimeType(file);
					Log.v(TAG, "WebHandler returned file \"" + file + "\"");
					if (new File(file).exists()) {
						return NanoHTTPD.newChunkedResponse(NanoHTTPD.Response.Status.OK, mimeType, new FileInputStream(file));
					} else {
						return NanoHTTPD.newFixedLengthResponse(NanoHTTPD.Response.Status.NOT_FOUND, NanoHTTPD.MIME_PLAINTEXT, "");
					}
				} else {
					return NanoHTTPD.newFixedLengthResponse(NanoHTTPD.Response.Status.NOT_FOUND, NanoHTTPD.MIME_PLAINTEXT, "");
				}
			}
		};
	}

	private WebHandler createDeleteHandler(File path) {
		Log.v(TAG, "Created web delete handler for path \"" + path.getAbsolutePath() + "\"");
		return new WebHandler() {
			@Override
			public NanoHTTPD.Response getResponse(NanoHTTPD.IHTTPSession session) throws IOException {
				Log.v(TAG, "Received request at delete endpoint");
				if (session.getMethod() == NanoHTTPD.Method.POST) {
					Log.v(TAG, "Headers: " + session.getHeaders().toString());
					String referer = session.getHeaders().getOrDefault("referer", "").trim();
					String filename = session.getHeaders().get("filename");
					File file = new File(path, filename);
					if (!referer.equals("http://192.168.43.1:8080/practice/stats")) {
						Log.w(TAG, "Delete handler did not delete file \"" + filename + "\" due to incorrect referer: \"" + referer + "\"");
						return NanoHTTPD.newFixedLengthResponse(NanoHTTPD.Response.Status.UNAUTHORIZED, NanoHTTPD.MIME_PLAINTEXT, "");
					} else if (!file.exists()) {
						Log.w(TAG, "Delete handler did not delete file \"" + filename + "\" due to file not existing");
						return NanoHTTPD.newFixedLengthResponse(NanoHTTPD.Response.Status.NOT_FOUND, NanoHTTPD.MIME_PLAINTEXT, "");
					} else if (PracticeApp.DISALLOWED_DELETE_FILES.contains(file.getName())) {
						Log.w(TAG, "Delete handler did not delete file \"" + filename + "\" due to this file being disallowed to delete");
						return NanoHTTPD.newFixedLengthResponse(NanoHTTPD.Response.Status.FORBIDDEN, NanoHTTPD.MIME_PLAINTEXT, "");
					} else {
						Log.d(TAG, "Delete handler is deleting file \"" + filename + "\"");
						boolean deleteSuccess = file.delete();
						Log.d(TAG, "Delete handler " + (deleteSuccess ? "successfully deleted" : "failed to delete ") + " file");
						if (deleteSuccess) {
							DataStorage.removeRunFromMain(file.getName());
							return NanoHTTPD.newFixedLengthResponse(NanoHTTPD.Response.Status.NO_CONTENT, NanoHTTPD.MIME_PLAINTEXT, "");
						} else {
							return NanoHTTPD.newFixedLengthResponse(NanoHTTPD.Response.Status.INTERNAL_ERROR, NanoHTTPD.MIME_PLAINTEXT, "");
						}
						
					}
				} else {
					return NanoHTTPD.newFixedLengthResponse(NanoHTTPD.Response.Status.METHOD_NOT_ALLOWED, NanoHTTPD.MIME_PLAINTEXT, "");
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
		public Long value;

		public Message(String event) {
			this.event = event;
		}

		public Message(String event, String name) {
			this.event = event;
			this.name = name;
		}

		public Message(String event, Integer value) {
			this(event, (long) value);
		}

		public Message(String event, Long value) {
			this.event = event;
			this.value = value;
		}

		public Message(String event, String name, Integer value) {
			this(event, name, (long) value);
		}

		public Message(String event, String name, Long value) {
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
		private WsHandler wsHandler;

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
			wsHandler.onClose(this);
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

	protected static class WsHandler {
		private static Set<Socket> sockets = new HashSet<Socket>();
		private boolean open = false;

		public void register(Socket socket) {
			this.sockets.add(socket);
			RobotEvent.registerWsHandler(this);
		}

		public void onOpen() {
			open = true;
			Log.d(TAG, "WS Opened");
		}

		public void onClose(Socket socket) {
			this.sockets.remove(socket);
			if (sockets.isEmpty()) {
				RobotEvent.unregisterWsHandler();
				open = false;
			}
			Log.d(TAG, "WS Closed");
		}

		public void onMessage(String json) {
			Log.v(TAG, "Received WS message \"" + json + "\"");
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
				case "getState":
					Data.RunState runState;
					float runTime = (float) RobotEvent.runTimer.time();

					if (RobotEvent.startingMatchPeriod == Data.RunState.MatchPeriod.AUTO) {
						if (runTime >= 30 && runTime < 38) {
							RobotEvent.matchPeriod = Data.RunState.MatchPeriod.TRANSITION;
							RobotEvent.periodTimerOffset = runTime - 30;
							RobotEvent.periodTimer.reset();
						} else if (runTime >= 38) {
							RobotEvent.matchPeriod = Data.RunState.MatchPeriod.TELEOP;
							RobotEvent.periodTimerOffset = runTime - 38;
							RobotEvent.periodTimer.reset();
						}
					} else if (RobotEvent.startingMatchPeriod == Data.RunState.MatchPeriod.TRANSITION) {
						if (runTime >= 8) {
							RobotEvent.matchPeriod = Data.RunState.MatchPeriod.TELEOP;
							RobotEvent.periodTimerOffset = runTime - 8;
							RobotEvent.periodTimer.reset();
						}
					}

					if (!RobotEvent.running || RobotEvent.runData == null) {
						runState = new Data.RunState(false);
					} else {
						runState = new Data.RunState(
							RobotEvent.running,
							RobotEvent.matchPeriod,
							(float) (RobotEvent.periodTimer.time() + RobotEvent.periodTimerOffset),
							RobotEvent.score,
							RobotEvent.runData.cycles,
							(float) RobotEvent.cycleTimer.time()
						);
					}

					String runStateJson = Data.RunState.toJson(runState);
					sendMessage(new Message("setState", runStateJson));
					Log.v(TAG, "Sent run state: \"" + runStateJson + "\"");
					break;
				case "saveRun":
					if (message.name == null || message.value == null) {
						Log.e(TAG, "Malformed save run message. Given data \"" + json + "\"");
						return;
					}
					if (message.name == "" || RobotEvent.runData == null) return;
					RobotEvent.runData.name = message.name;
					RobotEvent.runData.timestamp = message.value;
					DataStorage.saveRun(RobotEvent.runData);
					RobotEvent.runData = null;
					break;
				default:
					break;
			}
		}

		public void sendMessage(Message message) {
			Iterator<Socket> socketIterator = sockets.iterator();
			while (socketIterator.hasNext()) {
				Socket socket = socketIterator.next();
				socket.send(message);
			}
		}
	}

	private NanoWSD wsServer = new NanoWSD(8001) {
		@Override
		protected NanoWSD.WebSocket openWebSocket(NanoHTTPD.IHTTPSession handshake) {
			return new Socket(handshake);
		}
	};
}
