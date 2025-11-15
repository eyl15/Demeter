import React, { useState } from 'react';

const TextToSpeech = () => {
    const [text, setText] = useState('');
    const [isGenerating, setIsGenerating] = useState(false);
    const [isPlaying, setIsPlaying] = useState(false);
    const [selectedVoice, setSelectedVoice] = useState('JBFqnCBsd6RMkjVDRZzb');
    const [audioElement, setAudioElement] = useState<HTMLAudioElement | null>(null);

    const [error, setError] = useState<string | null>(null);
    const voices = [{
        id: '3uuRWB9kyEGWr019IxaR',
        name: 'Pino'
    },{
        id: 'lvEfOaHGjgQz1ZC9TeMS',
        name: 'Alcaraz'
    }];

    const handleGenerateAudio  = async () => {
        if (!text.trim()) {
            setError('Please enter some text.');
            return;
        }

        setIsGenerating(true);
        setError(null);
        
        try {
            console.log('[TextToSpeech] Sending request with:', { text, voiceId: '3uuRWB9kyEGWr019IxaR' });
            
            const response = await fetch('http://localhost:8080/api/text-to-speech', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                }, 
                body: JSON.stringify({
                    text,
                    voiceId: selectedVoice,
                    modelId: "eleven_multilingual_v2",
                    outputFormat: "mp3_44100_128",
                }),
            });
            const data = await response.json();
            
            if (!response.ok) {
                throw new Error(data.error || 'Failed to generate audio.');
            }
            
            const audio = new Audio(`data:audio/mpeg;base64,${data.audio}`);
            setAudioElement(audio);

            audio.onended = () => {
                setIsPlaying(false);
            };
            audio.play();
            setIsPlaying(true);
        } catch (err: any) {
            setError(err.message || 'An error occurred while generating audio.');
        } finally {
            setIsGenerating(false);
        }
    }
    const handlePlayPause = () => {
        if (audioElement) {
            if (isPlaying) {
                audioElement.pause();
                setIsPlaying(false);
            } else {
                audioElement.play();
                setIsPlaying(true);
            }
        }
    }

    return (
        <button onClick={handleGenerateAudio} disabled={isGenerating} text="Step 1 Sift flour, baking powder, sugar, and salt together in a large bowl. Make a well in the center and add milk, melted butter, and egg; mix until smooth." >Play Audio
    )
}