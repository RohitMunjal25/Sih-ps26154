#!/bin/sh

echo "======================================"
echo "Starting Ollama"
echo "======================================"

ollama serve &

OLLAMA_PID=$!

echo "Waiting for Ollama..."

until ollama list >/dev/null 2>&1
do
    sleep 2
done

echo "Ollama is ready."

echo "Pulling Gemma 3 4B..."
ollama pull gemma3:4b

echo "Pulling Qwen2.5-VL 7B..."
ollama pull qwen2.5vl:7b

echo "======================================"
echo "Models ready"
echo "Gemma: gemma3:4b"
echo "Qwen:  qwen2.5vl:7b"
echo "======================================"

wait $OLLAMA_PID