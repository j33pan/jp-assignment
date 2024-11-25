"use client";
import React, { useState, useEffect, useRef } from "react";
import { getPromptResponse } from "../../api/getPromptResponse";
import { ChatResponse, ChatPrompt, TextArea } from "../components/chat";

const agentTypes = {
  user: "User",
  richieRich: "RichieRich",
};

export default function Home() {
  const [isLoadingResponse, setIsLoadingResponse] = useState(false);
  const [messages, setMessages] = useState([]);
  const [prompt, setPrompt] = useState("");
  const [error, setError] = useState(null);
  const scrollContainerRef = useRef(null);

  const handleTextAreaChange = (event) => {
    setPrompt(event.target.value);
  };

  const addMessage = (message, agent) => {
    setMessages((prev) => [
      ...prev,
      {
        agent,
        contents: message,
      },
    ]);
  };

  const handleSubmit = async () => {
    if (!prompt) {
      setError("Please enter a prompt.");
      return;
    }

    setError(null);
    addMessage(prompt, agentTypes.user);
    setPrompt("");
    setIsLoadingResponse(true);

    const partialResponse = [];
    const eventSource = new EventSource("http://localhost:8081");

    eventSource.onopen = () => {
      console.log("Connection to stream established");
    };

    eventSource.onmessage = (event) => {
      if (event.data === "[DONE]") {
        eventSource.close();
        setIsLoadingResponse(false);
        addMessage(partialResponse.join(" "), agentTypes.richieRich);
      } else {
        partialResponse.push(event.data);
        setMessages((prev) => [
          ...prev.slice(0, -1), // Remove the last partial response
          { agent: agentTypes.richieRich, contents: partialResponse.join(" ") },
        ]);
      }
    };

    eventSource.onerror = () => {
      setError("An error occurred while streaming. Please try again.");
      setIsLoadingResponse(false);
      eventSource.close();
    };
  };

  useEffect(() => {
    scrollContainerRef.current.scrollTop =
      scrollContainerRef.current.scrollHeight;
  }, [messages]);

  return (
    <main className="flex flex-col items-center w-full bg-gray-100 h-[93vh]">
      <div
        ref={scrollContainerRef}
        className="flex flex-col overflow-y-scroll p-20 w-full mb-40"
      >
        {messages.map((message, index) =>
          message.agent === agentTypes.user ? (
            <ChatPrompt key={index} prompt={message.contents} />
          ) : (
            <ChatResponse key={index} response={message.contents} />
          )
        )}
      </div>
      <TextArea
        onChange={handleTextAreaChange}
        onSubmit={handleSubmit}
        isLoading={isLoadingResponse}
        hasError={error !== null}
      />
      {error && (
        <div className="absolute bottom-0 mb-2 text-red-500">{error}</div>
      )}
    </main>
  );
}
