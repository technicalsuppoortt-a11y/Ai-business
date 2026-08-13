import React, { useState, useEffect, useRef } from "react";
import { useApp } from "../context/AppContext";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import { motion, AnimatePresence } from "framer-motion";
import {
  Send,
  MessageSquare,
  Search,
  Users,
  X,
  Mic,
  Smile,
  Info,
  Paperclip,
  Play,
  Pause,
  FileText,
  FileImage,
  FileVideo,
  FileAudio,
  FileArchive,
  FileCode,
  FileSpreadsheet,
  File as FileIcon,
  XCircle,
  CornerDownLeft,
  MoreHorizontal,
  ChevronLeft,
  ChevronRight,
  Download,
  Reply,
  Copy,
  StopCircle,
  Trash2,
  Plus,
} from "lucide-react";
import EmojiPicker from "emoji-picker-react";
import { collection, query, where, onSnapshot, addDoc, updateDoc, doc, deleteDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { db, mediaStorage } from "../firebase";
import "./SupportSection.css";

const getFileIcon = (fileName) => {
  const ext = fileName.split(".").pop()?.toLowerCase() || "";
  if (["jpg", "jpeg", "png", "gif", "webp", "svg", "bmp", "ico"].includes(ext)) {
    return FileImage;
  }
  if (["mp4", "webm", "avi", "mov", "mkv", "flv"].includes(ext)) {
    return FileVideo;
  }
  if (["mp3", "wav", "ogg", "flac", "aac", "m4a"].includes(ext)) {
    return FileAudio;
  }
  if (["zip", "rar", "7z", "tar", "gz", "bz2"].includes(ext)) {
    return FileArchive;
  }
  if (
    [
      "js", "ts", "jsx", "tsx", "html", "css", "json", "xml", "py", "java", "cpp", "c", "go", "rs", "php", "rb",
    ].includes(ext)
  ) {
    return FileCode;
  }
  if (["xls", "xlsx", "csv", "ods"].includes(ext)) {
    return FileSpreadsheet;
  }
  if (["pdf", "doc", "docx", "txt", "rtf", "md"].includes(ext)) {
    return FileText;
  }
  return FileIcon;
};

export default function SupportSection() {
  const { state } = useApp();
  const { userData: userProfile, isAdmin: contextIsAdmin } = useAuth();
  const isAdmin = contextIsAdmin || userProfile?.role === "admin" || userProfile?.role === "superadmin";
  const toast = useToast();

  const isRtl = state.language?.startsWith("ar");
  const t = (ar, en) => (isRtl ? ar : en);

  const [users, setUsers] = useState([]);
  
  useEffect(() => {
    if (isAdmin) {
      const q = query(collection(db, "users"));
      const unsub = onSnapshot(q, (snap) => {
        setUsers(snap.docs.map((d) => ({ uid: d.id, ...d.data() })));
      });
      return () => unsub();
    }
  }, [isAdmin]);

  const partners = users.filter((u) => u.role !== "admin" && u.role !== "superadmin");

  // State
  const [activeDmPartnerId, setActiveDmPartnerId] = useState(
    isAdmin ? null : userProfile?.uid || null,
  );

  const [activeChatIds, setActiveChatIds] = useState(new Set());

  useEffect(() => {
    if (isAdmin && partners.length > 0 && !activeDmPartnerId) {
      const firstActivePartner = partners.find((p) => activeChatIds.has(p.uid));
      if (firstActivePartner) {
        setActiveDmPartnerId(firstActivePartner.uid);
      }
    }
  }, [isAdmin, partners, activeDmPartnerId, activeChatIds]);

  const [messages, setMessages] = useState([]);

  useEffect(() => {
    if (!activeDmPartnerId) return;
    const q = query(
      collection(db, "support_chats"),
      where("chatId", "==", activeDmPartnerId),
    );
    const unsub = onSnapshot(q, (snap) => {
      const msgs = snap.docs.map((d) => ({
        id: d.id,
        ...d.data(),
      })).filter((m) => !m.isInit);
      msgs.sort((a, b) => (a.createdAt || 0) - (b.createdAt || 0));
      setMessages(msgs);
    });
    return () => unsub();
  }, [activeDmPartnerId]);

  // Mark support chat messages as read when loaded in the active chat view
  useEffect(() => {
    const unreadMsgs = messages.filter(
      (m) => m.authorId !== (userProfile?.uid || "999") && !m.read,
    );
    if (unreadMsgs.length > 0) {
      unreadMsgs.forEach(async (m) => {
        try {
          await updateDoc(doc(db, "support_chats", m.id), {
            read: true,
          });
        } catch (err) {
          console.error("Failed to mark chat message as read:", err);
        }
      });
    }
  }, [messages, userProfile]);

  useEffect(() => {
    if (!isAdmin) return;
    const q = collection(db, "support_chats");
    const unsub = onSnapshot(q, (snap) => {
      const ids = new Set();
      snap.docs.forEach((d) => {
        const data = d.data();
        if (data.chatId) ids.add(data.chatId);
      });
      setActiveChatIds(ids);
    });
    return () => unsub();
  }, [isAdmin]);

  const [typedMessage, setTypedMessage] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [isNewChatModalOpen, setIsNewChatModalOpen] = useState(false);
  const [newChatSearchQuery, setNewChatSearchQuery] = useState("");
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const emojiPickerRef = useRef(null);
  const [mobileView, setMobileView] = useState(isAdmin ? "list" : "chat");

  // Reply State
  const [replyTo, setReplyTo] = useState(null);

  // Voice Recording State
  const [isRecording, setIsRecording] = useState(false);
  const [recordingDuration, setRecordingDuration] = useState(0);
  const [audioUrl, setAudioUrl] = useState(null);
  const [isPlayingVoice, setIsPlayingVoice] = useState(false);
  const [voiceProgress, setVoiceProgress] = useState(0);
  const [playingMessageId, setPlayingMessageId] = useState(null);
  const mediaRecorderRef = useRef(null);
  const audioRef = useRef(null);
  const recordingTimerRef = useRef(null);
  const streamRef = useRef(null);

  // Attachment State
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [filePreviews, setFilePreviews] = useState([]);
  const fileInputRef = useRef(null);

  // Message Context Menu
  const [contextMenu, setContextMenu] = useState(null);

  // Info Modal State
  const [isInfoModalOpen, setIsInfoModalOpen] = useState(false);

  // Chat scroll anchor
  const chatEndRef = useRef(null);
  const messageRefs = useRef(new Map());
  const inputContainerRef = useRef(null);

  // Close emoji picker when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (emojiPickerRef.current && !emojiPickerRef.current.contains(event.target)) {
        setShowEmojiPicker(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Close context menu on click outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (contextMenu) {
        const target = event.target;
        if (!target.closest(".sup-context-menu") && !target.closest(".sup-message-options-btn")) {
          setContextMenu(null);
        }
      }
    };
    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, [contextMenu]);

  // Auto scroll to bottom
  const scrollToBottom = () => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [activeDmPartnerId, messages]);

  // Cleanup recording on unmount
  useEffect(() => {
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
      }
      if (recordingTimerRef.current) {
        clearInterval(recordingTimerRef.current);
      }
      if (audioUrl) {
        URL.revokeObjectURL(audioUrl);
      }
      filePreviews.forEach((preview) => URL.revokeObjectURL(preview));
    };
  }, []);

  const uploadChatFile = async (file) => {
    if (mediaStorage) {
      const fileRef = ref(mediaStorage, `chat_attachments/${Date.now()}_${file.name}`);
      await uploadBytes(fileRef, file);
      return await getDownloadURL(fileRef);
    }
    return URL.createObjectURL(file);
  };

  // Handle Send Message
  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!typedMessage.trim() && selectedFiles.length === 0) return;

    let messageText = typedMessage.trim();

    // Upload files if any
    const uploadedFiles = [];
    if (selectedFiles.length > 0) {
      toast(t("جاري رفع الملفات...", "Uploading files..."), "info");
      for (const file of selectedFiles) {
        try {
          const downloadUrl = await uploadChatFile(file);
          uploadedFiles.push({
            name: file.name,
            size: file.size,
            type: file.type,
            dataUrl: downloadUrl,
          });
        } catch (err) {
          console.error("File upload failed:", err);
          toast(t(`فشل رفع ${file.name}`, `Failed to upload ${file.name}`), "error");
        }
      }
    }

    const replyContext = replyTo
      ? {
          replyToId: replyTo.messageId,
          replyToSender: replyTo.sender,
          replyToText: replyTo.text,
        }
      : undefined;

    try {
      const msgData = {
        chatId: activeDmPartnerId,
        authorId: userProfile?.uid || "999",
        authorName: userProfile?.name || "Support",
        text: messageText,
        createdAt: Date.now(),
        files: uploadedFiles,
        ...(replyContext ? { replyContext } : {}),
      };

      await addDoc(collection(db, "support_chats"), msgData);
    } catch (err) {
      console.error(err);
      toast(t("فشل إرسال الرسالة", "Failed to send message"), "error");
    }

    setTypedMessage("");
    setShowEmojiPicker(false);
    setSelectedFiles([]);
    setFilePreviews([]);
    setReplyTo(null);
  };

  // ============================================================
  // FILE ATTACHMENT HANDLERS
  // ============================================================
  const handleFileSelect = (e) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const newFiles = [];
    const newPreviews = [];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      if (file.size > 10 * 1024 * 1024) {
        toast(
          t(
            `الملف ${file.name} كبير جداً (الحد الأقصى 10MB)`,
            `File ${file.name} is too large (max 10MB)`,
          ),
          "error"
        );
        continue;
      }
      newFiles.push(file);

      if (file.type.startsWith("image/")) {
        const reader = new FileReader();
        reader.onload = (e) => {
          if (e.target?.result) {
            newPreviews.push(e.target.result);
          }
        };
        reader.readAsDataURL(file);
      } else {
        newPreviews.push("");
      }
    }

    setSelectedFiles((prev) => [...prev, ...newFiles]);
    setFilePreviews((prev) => [...prev, ...newPreviews]);

    toast(t(`تم إضافة ${newFiles.length} ملف`, `${newFiles.length} file(s) added`), "success");
  };

  const removeFile = (index) => {
    setSelectedFiles((prev) => prev.filter((_, i) => i !== index));
    setFilePreviews((prev) => prev.filter((_, i) => i !== index));
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  const formatFileSize = (bytes) => {
    if (bytes < 1024) return bytes + " B";
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
    if (bytes < 1024 * 1024 * 1024) return (bytes / (1024 * 1024)).toFixed(1) + " MB";
    return (bytes / (1024 * 1024 * 1024)).toFixed(1) + " GB";
  };

  // ============================================================
  // REAL VOICE RECORDING
  // ============================================================
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;

      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;

      const chunks = [];

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          chunks.push(e.data);
        }
      };

      mediaRecorder.onstop = () => {
        if (chunks.length === 0) {
          toast(t("لم يتم تسجيل أي صوت", "No audio recorded"), "warning");
          return;
        }
        const blob = new Blob(chunks, { type: "audio/webm" });
        const url = URL.createObjectURL(blob);
        setAudioUrl(url);

        if (audioRef.current) {
          audioRef.current.src = url;
        }

        toast(t("تم تسجيل الرسالة الصوتية", "Voice message recorded"), "success");
      };

      mediaRecorder.start();
      setIsRecording(true);
      setRecordingDuration(0);

      recordingTimerRef.current = setInterval(() => {
        setRecordingDuration((prev) => prev + 1);
      }, 1000);

      toast(t("جاري التسجيل... اضغط على إيقاف للإنهاء", "Recording... Press stop to finish"), "info");
    } catch (error) {
      console.error("Error accessing microphone:", error);
      toast(t("لا يمكن الوصول إلى المايكروفون", "Cannot access microphone"), "error");
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);

      if (recordingTimerRef.current) {
        clearInterval(recordingTimerRef.current);
        recordingTimerRef.current = null;
      }

      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
        streamRef.current = null;
      }
    }
  };

  const cancelRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      try {
        mediaRecorderRef.current.stop();
      } catch (e) {}
      mediaRecorderRef.current = null;
      setIsRecording(false);
    }

    if (recordingTimerRef.current) {
      clearInterval(recordingTimerRef.current);
      recordingTimerRef.current = null;
    }

    if (streamRef.current) {
      try {
        streamRef.current.getTracks().forEach((track) => {
          track.stop();
          track.enabled = false;
        });
        streamRef.current = null;
      } catch (e) {}
    }

    if (audioUrl) {
      URL.revokeObjectURL(audioUrl);
      setAudioUrl(null);
    }

    setRecordingDuration(0);
    setVoiceProgress(0);
    setIsPlayingVoice(false);
    setPlayingMessageId(null);

    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.src = "";
      audioRef.current = null;
    }

    mediaRecorderRef.current = null;

    toast(t("تم إلغاء التسجيل", "Recording cancelled"), "info");
  };

  const sendVoiceMessage = async () => {
    if (!audioUrl) return;

    let finalAudioUrl = audioUrl;
    try {
      const response = await fetch(audioUrl);
      const blob = await response.blob();
      const file = new File([blob], `voice_${Date.now()}.webm`, { type: "audio/webm" });
      finalAudioUrl = await uploadChatFile(file);
    } catch (err) {
      console.error("Failed to upload voice message:", err);
    }

    const duration = recordingDuration;

    try {
      const msgData = {
        chatId: activeDmPartnerId,
        authorId: userProfile?.uid || "999",
        authorName: userProfile?.name || "Support",
        text: `🎤 رسالة صوتية`,
        createdAt: Date.now(),
        isVoice: true,
        duration: duration,
        audioData: finalAudioUrl,
      };

      await addDoc(collection(db, "support_chats"), msgData);
      toast(t("تم إرسال الرسالة الصوتية", "Voice message sent"), "success");
    } catch (err) {
      console.error(err);
      toast(t("فشل إرسال الرسالة الصوتية", "Failed to send voice message"), "error");
    }

    setAudioUrl(null);
    setRecordingDuration(0);
    setVoiceProgress(0);
    setIsPlayingVoice(false);
    setPlayingMessageId(null);
    mediaRecorderRef.current = null;
  };

  // Handle audio playback
  const togglePlayAudio = (messageId, audioData) => {
    if (playingMessageId === messageId && isPlayingVoice) {
      if (audioRef.current) {
        audioRef.current.pause();
      }
      setIsPlayingVoice(false);
      setPlayingMessageId(null);
      setVoiceProgress(0);
      return;
    }

    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }

    const audio = new Audio(audioData);
    audioRef.current = audio;

    audio.play();
    setIsPlayingVoice(true);
    setPlayingMessageId(messageId);
    setVoiceProgress(0);

    audio.ontimeupdate = () => {
      if (audio.duration) {
        const progress = (audio.currentTime / audio.duration) * 100;
        setVoiceProgress(progress);
      }
    };

    audio.onended = () => {
      setIsPlayingVoice(false);
      setPlayingMessageId(null);
      setVoiceProgress(0);
    };

    audio.onerror = () => {
      toast(t("حدث خطأ في تشغيل الصوت", "Error playing audio"), "error");
      setIsPlayingVoice(false);
      setPlayingMessageId(null);
      setVoiceProgress(0);
    };
  };

  // ============================================================
  // CONTEXT MENU HANDLERS
  // ============================================================
  const openMessageOptions = (messageId, event) => {
    event.stopPropagation();
    if (contextMenu === messageId) {
      setContextMenu(null);
    } else {
      setContextMenu(messageId);
    }
  };

  const handleCopyMessage = (text) => {
    navigator.clipboard.writeText(text);
    toast(t("تم نسخ الرسالة", "Message copied"), "success");
    setContextMenu(null);
  };

  const handleDeleteMessage = async (messageId) => {
    try {
      await deleteDoc(doc(db, "support_chats", String(messageId)));
      toast(t("تم حذف الرسالة بنجاح", "Message deleted successfully"), "success");
    } catch (err) {
      console.error("Failed to delete message:", err);
      toast(t("فشل حذف الرسالة", "Failed to delete message"), "error");
    }
    setContextMenu(null);
  };

  const handleReplyMessage = (
    messageId,
    sender,
    text,
    isOwn,
  ) => {
    const msg = messages.find((m) => m.id === messageId);

    if (msg) {
      setReplyTo({
        messageId: msg.id,
        sender: isOwn ? t("أنت", "You") : sender,
        text: msg.text || (msg.isVoice ? "🎤 رسالة صوتية" : ""),
        isOwn: isOwn,
      });

      const input = document.querySelector('input[type="text"]');
      if (input) {
        input.focus();
      }

      if (inputContainerRef.current) {
        inputContainerRef.current.scrollIntoView({ behavior: "smooth", block: "end" });
      }
    }
    setContextMenu(null);
  };

  const cancelReply = () => {
    setReplyTo(null);
  };

  // ============================================================
  // INFO MODAL HANDLERS
  // ============================================================
  const openInfoModal = () => {
    setIsInfoModalOpen(true);
  };

  const closeInfoModal = () => {
    setIsInfoModalOpen(false);
  };

  // Get channel or user info
  const getInfoData = () => {
    if (!isAdmin) {
      return {
        type: "user",
        name: t(" فريق جو", "Joe Team Support"),
        level: "Admin",
        sales: 0,
        revenue: 0,
        streak: 0,
        online: true,
      };
    }
    const partner = partners.find((p) => p.uid === activeDmPartnerId);
    return {
      type: "user",
      name: partner?.name || "Unknown",
      level: partner?.level || "Silver",
      sales: partner?.sales || 0,
      revenue: partner?.revenue || 0,
      streak: partner?.streak || 0,
      online: activeDmPartnerId !== null ? isUserOnline(activeDmPartnerId) : false,
    };
  };

  // Check if user is online
  const isUserOnline = (userId) => {
    const uProfile = users.find((u) => u.uid === userId);
    if (!uProfile) {
      if (userId === "999") {
        // Find any admin user and check if they are online
        const adminUser = users.find((u) => u.role === "admin" || u.role === "superadmin");
        if (adminUser && adminUser.lastActive) {
          const lastActiveTime =
            typeof adminUser.lastActive === "string"
              ? new Date(adminUser.lastActive).getTime()
              : Number(adminUser.lastActive);
          return Date.now() - lastActiveTime < 70000;
        }
      }
      return false;
    }
    if (!uProfile.lastActive) return false;
    const lastActiveTime =
      typeof uProfile.lastActive === "string"
        ? new Date(uProfile.lastActive).getTime()
        : Number(uProfile.lastActive);
    return Date.now() - lastActiveTime < 70000;
  };

  // Get active partner info for DM title
  const activeDmPartner = isAdmin
    ? partners.find((p) => p.uid === activeDmPartnerId)
    : { name: t(" فريق جو", "Joe Team Support"), level: "Admin", uid: "999" };

  const filteredPartners = partners.filter((p) => {
    const matchesSearch = (p.name || "").toLowerCase().includes(searchQuery.toLowerCase());
    const hasChatOrIsActive = !isAdmin || activeChatIds.has(p.uid) || p.uid === activeDmPartnerId;
    return matchesSearch && hasChatOrIsActive;
  });

  // Format duration
  const formatDuration = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const infoData = getInfoData();

  // ----- RENDER -----
  return (
    <div
      className="sup-container"
      dir={isRtl ? "rtl" : "ltr"}
    >
      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept="image/*,.pdf,.doc,.docx,.txt,.xls,.xlsx,.csv,.zip,.rar,.js,.ts,.html,.css,.json,.xml,.py,.java,.cpp,.c,.go,.rs,.php,.rb,.md,.rtf"
        style={{ display: 'none' }}
        onChange={handleFileSelect}
      />

      <div className="sup-flex-wrapper">
        {/* ============================================================ */}
        {/* 1. Sidebar - hidden on mobile, shown on md+ */}
        {/* ============================================================ */}
        {isAdmin && (
          <div
            className={`sup-sidebar ${mobileView === "list" ? "" : "hidden-on-mobile"} ${isRtl ? "border-l" : "border-r"}`}
          >
            {/* Sidebar Header */}
            <div className="sup-sidebar-header">
              <div className="sup-sidebar-title-row">
                <h3 className="sup-sidebar-title">
                  <Users className="h-5 w-5 text-purple-500" />
                  <span>{t("استفسارات الدعم", "Support Inquiries")}</span>
                </h3>
                {isAdmin && (
                  <button
                    type="button"
                    onClick={() => {
                      setNewChatSearchQuery("");
                      setIsNewChatModalOpen(true);
                    }}
                    className="sup-btn-icon-primary"
                    title={t("محادثة جديدة", "New Chat")}
                  >
                    <Plus className="h-4.5 w-4.5" />
                  </button>
                )}
              </div>

              {/* Search bar */}
              <div className="sup-search-wrapper">
                <Search
                  className={`sup-search-icon ${isRtl ? "right" : "left"}`}
                />
                <input
                  type="text"
                  placeholder={t("ابحث عن شريك...", "Search partner...")}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className={`sup-search-input ${isRtl ? "pr" : "pl"}`}
                />
              </div>
            </div>

            {/* Lists Container */}
            <div className="sup-partners-list">
              <div className="">
                <span
                  className="sup-partners-section-title"
                >
                  {t("الشركاء", "Partners")}
                </span>
                {filteredPartners.map((partner) => (
                  <button
                    type="button"
                    key={partner.uid}
                    onClick={() => {
                      setActiveDmPartnerId(partner.uid);
                      setMobileView("chat");
                    }}
                    className={`sup-partner-btn ${activeDmPartnerId === partner.uid ? "active" : ""}`}
                  >
                    <div className="sup-avatar-wrapper">
                      <div className="sup-avatar-bg">
                        {partner.name
                          ?.split(" ")
                          .map((w) => w[0])
                          .slice(0, 2)
                          .join("")}
                      </div>
                      <div
                        className={`sup-status-dot ${isUserOnline(partner.uid) ? "online" : "offline"}`}
                      />
                    </div>
                    <div className="sup-partner-info">
                      <div className="sup-partner-name-row">
                        <span className="sup-partner-name">
                          {partner.name}
                        </span>
                        {partner.streak !== undefined && partner.streak > 5 && (
                          <span
                            className="sup-streak"
                            title="Streak active"
                          >
                            🔥 {partner.streak}
                          </span>
                        )}
                      </div>
                      <span className="sup-partner-status-text">
                        {isUserOnline(partner.uid)
                          ? t("🟢 متصل الآن", "🟢 Online")
                          : t("⚪ غير متصل", "⚪ Offline")}
                      </span>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Current user bar */}
            <div className="sup-current-user-bar">
              <div className="sup-avatar-wrapper">
                <div className="sup-current-user-avatar">
                  {(userProfile?.name || "Joe Partner")
                    .split(" ")
                    .map((w) => w[0])
                    .slice(0, 2)
                    .join("")}
                </div>
                <div className="sup-status-dot online" />
              </div>
              <div className="sup-current-user-info">
                <span className="sup-current-user-name">
                  {userProfile?.name || "Joe Partner"}
                </span>
                <span className="sup-current-user-status">
                  {t("🟢 متصل الآن", "🟢 Online")}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* ============================================================ */}
        {/* 2. Main Chat Workspace */}
        {/* ============================================================ */}
        <div
          className={`sup-chat-workspace ${mobileView === "chat" ? "" : "hidden-on-mobile"}`}
        >
          {/* Chat Header */}
          <div className="sup-chat-header">
            <div className="sup-chat-header-left">
              {/* Back Button for mobile */}
              {isAdmin && (
                <button
                  type="button"
                  onClick={() => setMobileView("list")}
                  className="sup-back-btn"
                  title={t("رجوع", "Back")}
                >
                  {isRtl ? (
                    <ChevronRight className="h-5 w-5" />
                  ) : (
                    <ChevronLeft className="h-5 w-5" />
                  )}
                </button>
              )}

              <div className="sup-avatar-wrapper">
                <div className="sup-chat-partner-avatar">
                  <span className="sup-chat-partner-initials">
                    {activeDmPartner?.name
                      ?.split(" ")
                      ?.map((w) => w[0])
                      ?.slice(0, 2)
                      ?.join("") || "SP"}
                  </span>
                </div>
                {activeDmPartnerId !== null && (
                  <div
                    className={`sup-chat-partner-dot ${isUserOnline(activeDmPartnerId) ? "online" : "offline"}`}
                  />
                )}
              </div>
              <div>
                <h4 className="sup-chat-partner-name">
                  {activeDmPartner?.name}
                </h4>
                <div className="sup-chat-partner-status-row">
                  <p className="sup-chat-partner-status-label">
                    {activeDmPartnerId !== null && isUserOnline(activeDmPartnerId)
                      ? t("🟢 متصل الآن", "🟢 Online")
                      : t("⚪ غير متصل", "⚪ Offline")}
                  </p>
                  {activeDmPartnerId !== null && isUserOnline(activeDmPartnerId) && (
                    <span className="sup-status-pulse" />
                  )}
                </div>
              </div>
            </div>

            <div className="">
              <button
                type="button"
                onClick={openInfoModal}
                className="sup-icon-btn"
                title={t("معلومات", "Info")}
              >
                <Info className="h-4.5 w-4.5" />
              </button>
            </div>
          </div>

          {/* Message Feed Area - Improved colors */}
          <div className="sup-messages-area">
            {(() => {
              const currentMsgs = messages;

              if (currentMsgs.length === 0) {
                return (
                  <div className="sup-empty-state">
                    <div className="sup-empty-icon-wrap">
                      <MessageSquare className="h-8 w-8 animate-pulse" />
                    </div>
                    <div className="space-y-1">
                      <h5 className="sup-empty-title">
                        {t("لا توجد رسائل بعد", "No messages yet")}
                      </h5>
                      <p className="sup-empty-subtitle">
                        {t(
                          "ابدأ المحادثة الآن وشارك الفريق!",
                          "Start the conversation and connect with the team!",
                        )}
                      </p>
                    </div>
                  </div>
                );
              }

              return currentMsgs.map((msg) => {
                const isOwn = msg.authorId === userProfile?.uid;

                let senderName = t("مستخدم", "User");
                if (isOwn) {
                  senderName = t("أنت", "You");
                } else if (isAdmin) {
                  const partner = users.find((u) => u.uid === msg.authorId);
                  senderName = partner ? partner.name : t("شريك", "Partner");
                } else {
                  senderName = t(" فريق جو", "Joe Team Support");
                }

                const sender = {
                  name: senderName,
                  isMe: isOwn,
                };

                const msgTime = msg.createdAt
                  ? new Date(msg.createdAt).toLocaleTimeString(isRtl ? "ar-EG" : "en-US", {
                      hour: "2-digit",
                      minute: "2-digit",
                    })
                  : msg.time || "";

                let messageText = msg.text || "";
                if (msg.isVoice) {
                  messageText = "🎤 رسالة صوتية";
                } else if (msg.files && msg.files.length > 0) {
                  messageText = `📎 ملفات: ${msg.files.map((f) => f.name).join(", ")}`;
                }

                return (
                  <div
                    key={msg.id}
                    ref={(el) => {
                      if (el) {
                        messageRefs.current.set(msg.id, el);
                      }
                    }}
                    className={`sup-message-row ${isOwn ? "own" : "other"} ${isRtl ? "rtl" : ""}`}
                    onContextMenu={(e) => {
                      e.preventDefault();
                      openMessageOptions(msg.id, e);
                    }}
                  >
                    {/* Sender Avatar */}
                    <div
                      className={`sup-message-avatar ${isOwn ? "own" : "other"}`}
                    >
                      {sender.name
                        .split(" ")
                        .map((w) => w[0])
                        .slice(0, 2)
                        .join("")}
                    </div>

                    {/* Message Bubble Container */}
                    <div className="sup-message-content">
                      {/* Author and Date metadata - Improved colors */}
                      <div
                        className={`sup-message-meta ${isOwn ? "own" : "other"} ${isRtl ? "rtl" : ""}`}
                      >
                        <span
                          className={`sup-meta-name ${isOwn ? "own" : "other"}`}
                        >
                          {isOwn ? t("أنت", "You") : sender.name}
                        </span>
                        <span className="sup-meta-dot">•</span>
                        <span className="sup-meta-time">
                          {msgTime}
                        </span>
                        {isOwn && (
                          <span className="sup-meta-ticks">
                            ✓✓
                          </span>
                        )}
                      </div>

                      {/* Reply Context */}
                      {msg.replyContext && (
                        <div
                          className={`sup-reply-context ${isOwn ? "own" : "other"}`}
                        >
                          <CornerDownLeft className="w-3 h-3" />
                          <span className="sup-reply-sender">{msg.replyContext.replyToSender}</span>
                          <span className="sup-reply-text">
                            {msg.replyContext.replyToText}
                          </span>
                        </div>
                      )}

                      {/* Bubble and Options Wrapper */}
                      <div className={`sup-message-bubble-wrapper ${isOwn ? "own" : "other"} ${isRtl ? "rtl" : ""}`}>
                        {/* Text block - Improved colors */}
                        <div
                          className={`sup-message-bubble ${isOwn ? "own" : "other"} ${isRtl ? "rtl" : ""}`}
                        >
                        {msg.isVoice ? (
                          <div className="sup-voice-player">
                            <button
                              onClick={() => togglePlayAudio(msg.id, msg.audioData || "")}
                              className={`sup-voice-play-btn ${isOwn ? "own" : "other"}`}
                            >
                              {playingMessageId === msg.id && isPlayingVoice ? (
                                <Pause className="w-4 h-4" />
                              ) : (
                                <Play className="w-4 h-4" />
                              )}
                            </button>
                            <div className="sup-voice-track-wrap">
                              <div className="sup-voice-track-row">
                                <div
                                  className={`sup-voice-track ${isOwn ? "own" : "other"}`}
                                >
                                  <div
                                    className={`sup-voice-progress ${isOwn ? "own" : "other"}`}
                                    style={{
                                      width: `${playingMessageId === msg.id ? voiceProgress : 0}%`,
                                    }}
                                  />
                                </div>
                                <span
                                  className={`sup-voice-time ${isOwn ? "own" : "other"}`}
                                >
                                  {formatDuration(msg.duration || 0)}
                                </span>
                              </div>
                            </div>
                          </div>
                        ) : msg.files && msg.files.length > 0 ? (
                          <div className="sup-file-attachments">
                            {msg.text && (
                              <div className="sup-file-text">{msg.text}</div>
                            )}
                            <div className="sup-file-list">
                              {msg.files.map((file, idx) => {
                                const FileIcon = getFileIcon(file.name);
                                const isImage = file.type?.startsWith("image/");
                                return (
                                  <div
                                    key={idx}
                                    className={`sup-file-item ${isOwn ? "own" : "other"}`}
                                  >
                                    {isImage ? (
                                      <div className="sup-file-img-wrap">
                                        <img
                                          src={file.dataUrl}
                                          alt={file.name}
                                          className="sup-file-img"
                                        />
                                      </div>
                                    ) : (
                                      <div
                                        className={`sup-file-icon-wrap ${isOwn ? "own" : "other"}`}
                                      >
                                        <FileIcon
                                          className={`sup-file-icon ${isOwn ? "own" : "other"}`}
                                        />
                                      </div>
                                    )}
                                    <div className="sup-file-info">
                                      <div
                                        className={`sup-file-name ${isOwn ? "own" : "other"}`}
                                      >
                                        {file.name}
                                      </div>
                                      <div
                                        className={`sup-file-size ${isOwn ? "own" : "other"}`}
                                      >
                                        {formatFileSize(file.size)}
                                      </div>
                                    </div>
                                    <a
                                      href={file.dataUrl}
                                      download={file.name}
                                      className={`sup-file-download-btn ${isOwn ? "own" : "other"}`}
                                      title={t("تحميل", "Download")}
                                    >
                                      <Download className="w-4 h-4" />
                                    </a>
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        ) : (
                          msg.text
                        )}
                        </div>
                        {/* Options Button (three dots) */}
                        <div style={{ position: "relative" }}>
                          <button
                            onClick={(e) => openMessageOptions(msg.id, e)}
                            className={`sup-message-options-btn ${isOwn ? "own" : "other"} ${isRtl ? "rtl" : ""}`}
                            title={t("خيارات", "Options")}
                          >
                            <MoreHorizontal className="w-4 h-4" />
                          </button>

                          {/* Inline Context Menu */}
                          <AnimatePresence>
                            {contextMenu === msg.id && (
                              <motion.div
                                initial={{ opacity: 0, scale: 0.95, y: -5 }}
                                animate={{ opacity: 1, scale: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.95, y: -5 }}
                                transition={{ duration: 0.15 }}
                                className="sup-context-menu"
                                style={{
                                  top: "calc(100% + 4px)",
                                  ...(isOwn ? (isRtl ? { left: 0 } : { right: 0 }) : (isRtl ? { right: 0 } : { left: 0 }))
                                }}
                              >
                                {/* Reply Button */}
                                <button
                                  onClick={() => handleReplyMessage(msg.id, senderName, messageText, isOwn)}
                                  className="sup-context-menu-item"
                                >
                                  <Reply className="w-4 h-4" />
                                  {t("رد", "Reply")}
                                </button>

                                {/* Divider */}
                                <div className="sup-context-menu-divider" />

                                {/* Copy Button */}
                                <button
                                  onClick={() => handleCopyMessage(messageText)}
                                  className="sup-context-menu-item"
                                >
                                  <Copy className="w-4 h-4" />
                                  {t("نسخ", "Copy")}
                                </button>

                                {/* Delete Button (Own messages or Admin) */}
                                {(isOwn || isAdmin) && (
                                  <>
                                    <div className="sup-context-menu-divider" />
                                    <button
                                      onClick={() => handleDeleteMessage(msg.id)}
                                      className="sup-context-menu-item danger"
                                    >
                                      <Trash2 className="w-4 h-4 text-red-500" />
                                      <span className="">{t("حذف", "Delete")}</span>
                                    </button>
                                  </>
                                )}
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              });
            })()}

            <div ref={chatEndRef} />
          </div>



          {/* ============================================================ */}
          {/* 4. Input Container - Fixed at bottom */}
          {/* ============================================================ */}
          <div ref={inputContainerRef} className="sup-input-container-wrap">
            <div className="sup-input-container">
              {/* Reply Indicator */}
              {replyTo && (
                <div className="sup-reply-indicator">
                  <div className="sup-reply-indicator-left">
                    <CornerDownLeft className="w-4 h-4 sup-reply-indicator-icon" />
                    <div className="sup-reply-indicator-content">
                      <span className="sup-reply-indicator-title">
                        {t(`رد على ${replyTo.sender}`, `Replying to ${replyTo.sender}`)}
                      </span>
                      <p className="sup-reply-indicator-text">
                        {replyTo.text}
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={cancelReply}
                    className="sup-icon-btn"
                    title={t("إلغاء الرد", "Cancel reply")}
                  >
                    <X className="w-4 h-4 text-slate-400" />
                  </button>
                </div>
              )}

              {/* Recording indicator - Improved colors */}
              {isRecording && (
                <div className="sup-recording-indicator">
                  <div className="sup-recording-left">
                    <div className="sup-recording-dot" />
                    <span className="sup-recording-title">
                      {t("جاري التسجيل...", "Recording...")}
                    </span>
                    <span className="sup-recording-time">
                      {formatDuration(recordingDuration)}
                    </span>
                  </div>
                  <div className="sup-recording-actions">
                    <button
                      type="button"
                      onClick={cancelRecording}
                      className="sup-recording-btn-cancel"
                    >
                      <XCircle className="h-3.5 w-3.5" />
                      {t("إلغاء", "Cancel")}
                    </button>
                    <button
                      type="button"
                      onClick={stopRecording}
                      className="sup-recording-btn-stop"
                    >
                      <StopCircle className="h-3.5 w-3.5" />
                      {t("إيقاف", "Stop")}
                    </button>
                  </div>
                </div>
              )}

              {/* Audio preview after recording - Improved colors */}
              {audioUrl && !isRecording && (
                <div className="sup-audio-preview">
                  <div className="sup-audio-preview-track-wrap">
                    <button
                      onClick={() => {
                        if (isPlayingVoice) {
                          if (audioRef.current) {
                            audioRef.current.pause();
                          }
                          setIsPlayingVoice(false);
                          setVoiceProgress(0);
                        } else {
                          const audio = new Audio(audioUrl);
                          audioRef.current = audio;
                          audio.play();
                          setIsPlayingVoice(true);
                          setVoiceProgress(0);
                          audio.ontimeupdate = () => {
                            if (audio.duration) {
                              setVoiceProgress((audio.currentTime / audio.duration) * 100);
                            }
                          };
                          audio.onended = () => {
                            setIsPlayingVoice(false);
                            setVoiceProgress(0);
                          };
                        }
                      }}
                      className="sup-audio-preview-btn"
                    >
                      {isPlayingVoice ? (
                        <Pause className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                      ) : (
                        <Play className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                      )}
                    </button>
                    <div className="">
                      <div className="sup-audio-preview-track-row">
                        <div className="sup-audio-preview-track">
                          <div
                            className="sup-audio-preview-progress"
                            style={{ width: `${isPlayingVoice ? voiceProgress : 0}%` }}
                          />
                        </div>
                        <span className="sup-audio-preview-time">
                          {formatDuration(recordingDuration)}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="sup-audio-preview-actions">
                    <button
                      type="button"
                      onClick={cancelRecording}
                      className="sup-recording-btn-cancel"
                    >
                      <XCircle className="h-3.5 w-3.5" />
                      {t("إلغاء", "Cancel")}
                    </button>
                    <button
                      type="button"
                      onClick={sendVoiceMessage}
                      className="sup-audio-preview-btn-send"
                    >
                      <Send className="h-3.5 w-3.5" />
                      {t("إرسال", "Send")}
                    </button>
                  </div>
                </div>
              )}

              {/* File attachments preview - Improved colors */}
              {selectedFiles.length > 0 && (
                <div className="sup-attachments-preview">
                  {selectedFiles.map((file, index) => {
                    const FileIcon = getFileIcon(file.name);
                    const isImage = file.type.startsWith("image/");
                    return (
                      <div
                        key={index}
                        className="sup-attachment-item"
                      >
                        {isImage && filePreviews[index] ? (
                          <div className="sup-attachment-img">
                            <img
                              src={filePreviews[index]}
                              alt=""
                              className=""
                            />
                          </div>
                        ) : (
                          <FileIcon className="w-4 h-4 text-slate-500 dark:text-slate-400" />
                        )}
                        <span className="sup-attachment-name">
                          {file.name}
                        </span>
                        <span className="sup-attachment-size">
                          {formatFileSize(file.size)}
                        </span>
                        <button
                          type="button"
                          onClick={() => removeFile(index)}
                          className="sup-attachment-remove"
                        >
                          <XCircle className="w-3.5 h-3.5 text-slate-400 hover:text-rose-500" />
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}

              <form onSubmit={handleSendMessage} className="sup-input-form">
                <div className="sup-emoji-wrapper" ref={emojiPickerRef}>
                  <button
                    type="button"
                    onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                    className="sup-input-btn"
                    title={t("إيموجي", "Emoji")}
                  >
                    <Smile className="h-5 w-5" />
                  </button>
                  {showEmojiPicker && (
                    <div className="sup-emoji-picker-container">
                      <EmojiPicker
                        onEmojiClick={(emoji) => {
                          setTypedMessage((prev) => prev + emoji.emoji);
                          setShowEmojiPicker(false);
                        }}
                        width={300}
                        height={350}
                        theme={state.settings?.theme}
                      />
                    </div>
                  )}
                </div>

                <button
                  type="button"
                  onClick={startRecording}
                  disabled={isRecording || !!audioUrl}
                  className={`sup-input-btn ${isRecording ? "recording" : audioUrl ? "disabled" : ""}`}
                  title={t("تسجيل صوتي", "Voice Record")}
                >
                  <Mic className="h-5 w-5" />
                </button>

                <button
                  type="button"
                  onClick={triggerFileInput}
                  className="sup-input-btn"
                  title={t("إرفاق ملف", "Attach File")}
                >
                  <Paperclip className="h-5 w-5" />
                </button>

                <input
                  type="text"
                  placeholder={
                    isRecording
                      ? t("جاري التسجيل...", "Recording...")
                      : replyTo
                        ? t(`رد على ${replyTo.sender}...`, `Reply to ${replyTo.sender}...`)
                        : t("اكتب رسالتك هنا...", "Write your message here...")
                  }
                  value={typedMessage}
                  onChange={(e) => setTypedMessage(e.target.value)}
                  disabled={isRecording || !!audioUrl}
                  className={`sup-text-input ${isRecording || audioUrl ? "disabled" : ""}`}
                  style={{ textAlign: isRtl ? "right" : "left" }}
                />

                <button
                  type="submit"
                  disabled={
                    (!typedMessage.trim() && selectedFiles.length === 0) ||
                    isRecording ||
                    !!audioUrl
                  }
                  className={`sup-send-btn ${(!typedMessage.trim() && selectedFiles.length === 0) || isRecording || audioUrl ? "disabled" : ""}`}
                >
                  <Send className="h-4 w-4" />
                  <span className="sup-send-btn-text">{t("إرسال", "Send")}</span>
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>

      {/* ============================================================ */}
      {/* 5. INFO MODAL */}
      {/* ============================================================ */}
      <AnimatePresence>
        {isInfoModalOpen && (
          <div className="sup-modal-overlay">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={closeInfoModal}
              className="sup-modal-bg"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="sup-modal-box"
            >
              <div className="sup-modal-header">
                <h4 className="sup-modal-title">
                  <Info className="h-5 w-5 text-purple-500" />
                  <span>{t("معلومات", "Info")}</span>
                </h4>
                <button
                  type="button"
                  onClick={closeInfoModal}
                  className="sup-modal-close"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="">
                <div className="">
                  <div className="sup-avatar-bg">
                    {infoData.name
                      ?.split(" ")
                      .map((w) => w[0])
                      .slice(0, 2)
                      .join("")}
                  </div>
                  <div>
                    <div className="font-bold text-sm text-slate-800 dark:text-white">
                      {infoData.name}
                    </div>
                    <div className="flex items-center gap-1.5 mt-0.5">
                      <span className="text-xs text-slate-550 dark:text-slate-400">
                        {infoData.level}
                      </span>
                      <span
                        className={`w-2 h-2 rounded-full ${infoData.online ? "bg-emerald-500" : "bg-slate-400"}`}
                      />
                      <span className="sup-info-stat-label">
                        {infoData.online ? t("متصل", "Online") : t("غير متصل", "Offline")}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="sup-info-stats-grid">
                  <div className="sup-info-stat-card">
                    <div className="sup-info-stat-val">
                      {infoData.sales}
                    </div>
                    <div className="sup-info-stat-label">
                      {t("صفقات", "Sales")}
                    </div>
                  </div>
                  <div className="sup-info-stat-card">
                    <div className="sup-info-stat-val">
                      ${infoData.revenue?.toLocaleString()}
                    </div>
                    <div className="sup-info-stat-label">
                      {t("إيرادات", "Revenue")}
                    </div>
                  </div>
                  <div className="sup-info-stat-card">
                    <div className="sup-info-stat-val">🔥 {infoData.streak}</div>
                    <div className="sup-info-stat-label">
                      {t("أيام متتالية", "Streak")}
                    </div>
                  </div>
                  <div className="sup-info-stat-card">
                    <div className="sup-info-stat-val">{infoData.level}</div>
                    <div className="text-[10px] text-slate-400 dark:text-slate-500">
                      {t("المستوى", "Level")}
                    </div>
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={closeInfoModal}
                className="sup-info-btn"
              >
                {t("إغلاق", "Close")}
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ============================================================ */}
      {/* 6. NEW CHAT MODAL */}
      {/* ============================================================ */}
      <AnimatePresence>
        {isNewChatModalOpen && (
          <div className="sup-modal-overlay">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsNewChatModalOpen(false)}
              className="sup-modal-bg"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="sup-modal-box"
              dir={isRtl ? "rtl" : "ltr"}
            >
              <div className="sup-modal-header">
                <h4 className="sup-modal-title">
                  <MessageSquare className="h-5 w-5 text-purple-500" />
                  <span>{t("محادثة جديدة", "New Conversation")}</span>
                </h4>
                <button
                  type="button"
                  onClick={() => setIsNewChatModalOpen(false)}
                  className="sup-modal-close"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="sup-search-wrapper">
                <Search
                  className={`absolute ${isRtl ? "right-3" : "left-3"} top-2.5 h-4 w-4 text-slate-400 dark:text-slate-500`}
                />
                <input
                  type="text"
                  placeholder={t("ابحث بالاسم أو الإيميل...", "Search by name or email...")}
                  value={newChatSearchQuery}
                  onChange={(e) => setNewChatSearchQuery(e.target.value)}
                  className={`w-full ${isRtl ? "pr-9 pl-4 text-right" : "pl-9 pr-4 text-left"} py-2 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 text-slate-800 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500`}
                />
              </div>

              <div className="sup-new-chat-list">
                {partners
                  .filter((p) => {
                    const q = newChatSearchQuery.toLowerCase();
                    return p.name?.toLowerCase().includes(q) || p.email?.toLowerCase().includes(q);
                  })
                  .map((partner) => (
                    <button
                      key={partner.uid}
                      type="button"
                      onClick={async () => {
                        setActiveDmPartnerId(partner.uid);
                        setMobileView("chat");
                        setIsNewChatModalOpen(false);

                        if (!activeChatIds.has(partner.uid)) {
                          try {
                            await addDoc(collection(db, "support_chats"), {
                              chatId: partner.uid,
                              authorId: "system",
                              authorName: "System",
                              isInit: true,
                              text: "Chat Initiated",
                              createdAt: Date.now(),
                              read: true
                            });
                          } catch (err) {
                            console.error("Failed to initialize chat", err);
                          }
                        }
                      }}
                      className={`w-full flex items-center gap-3 p-3 rounded-xl border border-transparent hover:border-slate-200 dark:hover:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-all ${isRtl ? "text-right" : "text-left"}`}
                    >
                      <div className="relative">
                        <div className="sup-avatar-bg">
                          {partner.name
                            ?.split(" ")
                            .map((w) => w[0])
                            .slice(0, 2)
                            .join("")}
                        </div>
                        <div
                          className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-white dark:border-slate-900 ${isUserOnline(partner.uid) ? "bg-emerald-500" : "bg-slate-400 dark:bg-slate-600"}`}
                        />
                      </div>
                      <div className="sup-new-chat-info">
                        <div className="sup-new-chat-name">
                          {partner.name}
                        </div>
                        {partner.email && (
                          <div className="sup-new-chat-email">
                            {partner.email}
                          </div>
                        )}
                      </div>
                      <ChevronLeft
                        className={`w-5 h-5 text-slate-400 ${isRtl ? "" : "rotate-180"}`}
                      />
                    </button>
                  ))}
                {partners.filter((p) => {
                  const q = newChatSearchQuery.toLowerCase();
                  return p.name?.toLowerCase().includes(q) || p.email?.toLowerCase().includes(q);
                }).length === 0 && (
                  <div className="h-full flex flex-col items-center justify-center text-center p-6 space-y-2">
                    <Search className="w-8 h-8 text-slate-300 dark:text-slate-600" />
                    <p className="text-sm text-slate-500 dark:text-slate-400">
                      {t("لم يتم العثور على شركاء", "No partners found")}
                    </p>
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
