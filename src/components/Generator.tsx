import type { ChatMessage } from "@/types";
import { createSignal, Index, Show, onMount, onCleanup } from "solid-js";
import IconClear from "./icons/Clear";
import MessageItem from "./MessageItem";
import SystemRoleSettings from "./SystemRoleSettings";
import { generateSignature } from "@/utils/auth";
import { useThrottleFn } from "solidjs-use";
import { storage } from "../utils/cookies";

export default () => {
  let inputRef: HTMLTextAreaElement;
  const [currentSystemRoleSettings, setCurrentSystemRoleSettings] =
    createSignal("");
  const [systemRoleEditing, setSystemRoleEditing] = createSignal(false);
  const [messageList, setMessageList] = createSignal<ChatMessage[]>([]);
  const [currentAssistantMessage, setCurrentAssistantMessage] =
    createSignal("");
  const [loading, setLoading] = createSignal(false);
  const [controller, setController] = createSignal<AbortController>(null);

  onMount(() => {
    try {
      if (localStorage.getItem("messageList")) {
        setMessageList(JSON.parse(localStorage.getItem("messageList")));
      }
      if (localStorage.getItem("systemRoleSettings")) {
        setCurrentSystemRoleSettings(
          localStorage.getItem("systemRoleSettings")
        );
      }
    } catch (err) {
      console.error(err);
    }

    window.addEventListener("beforeunload", handleBeforeUnload);
    onCleanup(() => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    });
  });

  const handleBeforeUnload = () => {
    localStorage.setItem("messageList", JSON.stringify(messageList()));
    localStorage.setItem("systemRoleSettings", currentSystemRoleSettings());
  };

  const handleButtonClick = async () => {
    const inputValue = inputRef.value;
    if (!inputValue) {
      return;
    }
    // @ts-ignore
    if (window?.umami) umami.trackEvent("chat_generate");
    inputRef.value = "";
    setMessageList([
      ...messageList(),
      {
        role: "user",
        content: inputValue,
      },
    ]);
    requestWithLatestMessage();
  };

  const smoothToBottom = useThrottleFn(
    () => {
      window.scrollTo({ top: document.body.scrollHeight, behavior: "smooth" });
    },
    300,
    false,
    true
  );

  const requestWithLatestMessage = async () => {
    setLoading(true);
    setCurrentAssistantMessage("");
    const storagePassword = localStorage.getItem("pass");
    try {
      const controller = new AbortController();
      setController(controller);
      const requestMessageList = [...messageList()];
      if (currentSystemRoleSettings()) {
        requestMessageList.unshift({
          role: "system",
          content: currentSystemRoleSettings(),
        });
      }
      const timestamp = Date.now();

      const response = await fetch("/api/generate", {
        method: "POST",
        body: JSON.stringify({
          messages: requestMessageList,
          time: timestamp,
          pass: storagePassword,
          sign: await generateSignature({
            t: timestamp,
            m:
              requestMessageList?.[requestMessageList.length - 1]?.content ||
              "",
          }),
        }),
        signal: controller.signal,
      });
      if (!response.ok) {
        throw new Error(response.statusText);
      }
      const data = response.body;

      if (!data) {
        throw new Error("No data");
      }
      const reader = data.getReader();
      const decoder = new TextDecoder("utf-8");
      let done = false;
     
     var countnum=0;
      
      while (!done) {
        const { value, done: readerDone } = await reader.read();

        if (value) {
          let char = decoder.decode(value);
          if (char === "\n" && currentAssistantMessage().endsWith("\n")) {
            continue;
          }
            
          if (char) {
          let  totalname = Base64.decode($.cookie('kj')) 
            let currentTotal =  localStorage.getItem(totalname)
            if (currentTotal === "" || currentTotal === "NaN") {
      
      
          localStorage.setItem(totalname, 0);

              
            }
            currentTotal =  localStorage.getItem(totalname)
            
            localStorage.setItem(totalname, parseInt(currentTotal) + 1);
          
              countnum += 1;           

            setCurrentAssistantMessage(currentAssistantMessage() + char);
            
          }
          smoothToBottom();
        }
        done = readerDone;
      }

    } catch (e) {
      console.error(e);
      setLoading(false);
      setController(null);
      return;
    }
    
    
    
      let  totalname = Base64.decode($.cookie('kj')) 
      let currentTotals=localStorage.getItem(totalname)
      document.getElementById('total').innerText = currentTotals;
      $.ajax({
        type:'post',
                            url: 'https://www.swdtbook.com/index/index/addaidata',
                            data: {"cookieid":totalname,"totalnum":currentTotals,"countnum":countnum},
                            dataType:'json',
                            async:false,
                            success: function(data) {
                                if(data>2){
                                alert('系统检测到您字数'+ data +'统计异常 已记录在案 请截全屏联系管理员说明 否则可能会被封号! ')
                                localStorage.setItem(totalname, data);
                                }
                                
                                  

                            },
                            error:function (data){

                                
                            }
                        });
    
    
    archiveCurrentMessage();
    
  };

  const archiveCurrentMessage = () => {
    if (currentAssistantMessage()) {
      setMessageList([
        ...messageList(),
        {
          role: "assistant",
          content: currentAssistantMessage(),
        },
      ]);
      setCurrentAssistantMessage("");
      setLoading(false);
      setController(null);
      inputRef.focus();
    }
  };

  const clear = () => {
    inputRef.value = "";
    inputRef.style.height = "auto";
    setMessageList([]);
    setCurrentAssistantMessage("");
    setCurrentSystemRoleSettings("");
  };

  const stopStreamFetch = () => {
    if (controller()) {
      controller().abort();
      archiveCurrentMessage();
    }
  };

  const retryLastFetch = () => {
    if (messageList().length > 0) {
      const lastMessage = messageList()[messageList().length - 1];
      
      if (lastMessage.role === "assistant") {
        setMessageList(messageList().slice(0, -1));
        requestWithLatestMessage();
      }
    }
  };

  const handleKeydown = (e: KeyboardEvent) => {
    if (e.isComposing || e.shiftKey) {
      return;
    }
    if (e.key === "Enter") {
      handleButtonClick();
    }
  };

  return (
    <div my-6>
      <SystemRoleSettings
        canEdit={() => messageList().length === 0}
        systemRoleEditing={systemRoleEditing}
        setSystemRoleEditing={setSystemRoleEditing}
        currentSystemRoleSettings={currentSystemRoleSettings}
        setCurrentSystemRoleSettings={setCurrentSystemRoleSettings}
      />
      <Index each={messageList()}>
        {(message, index) => (
          <MessageItem
            role={message().role}
            message={message().content}
            showRetry={() =>
              message().role === "assistant" &&
              index === messageList().length - 1
            }
            onRetry={retryLastFetch}
          />
        )}
      </Index>
      {currentAssistantMessage() && (
        <MessageItem role="assistant" message={currentAssistantMessage} />
      )}
      <Show
        when={!loading()}
        fallback={() => (
          <div class="gen-cb-wrapper">
            <span>AI is thinking...</span>
            <div class="gen-cb-stop" onClick={stopStreamFetch}>
              Stop
            </div>
          </div>
        )}
      >
        <div class="gen-text-wrapper" class:op-50={systemRoleEditing()}>
          <textarea
            ref={inputRef!}
            disabled={systemRoleEditing()}
            onKeyDown={handleKeydown}
            placeholder="Enter something..."
            autocomplete="off"
            autofocus
            onInput={() => {
              inputRef.style.height = "auto";
              inputRef.style.height = inputRef.scrollHeight + "px";
            }}
            rows="1"
            class="gen-textarea"
          />
          <button
            onClick={handleButtonClick}
            disabled={systemRoleEditing()}
            gen-slate-btn
          >
            Send
          </button>
          <button
            title="Clear"
            onClick={clear}
            disabled={systemRoleEditing()}
            gen-slate-btn
          >
            <IconClear />
          </button>
        </div>
      </Show>
    </div>
  );
};
