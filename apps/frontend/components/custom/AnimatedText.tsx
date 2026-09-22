"use client";



import { AnimatePresence, motion } from "framer-motion";

import { useEffect, useState } from "react";


export const WORDS = ["HEALING ", "GROWTH", "PEACE", "CLARITY", "BALANCE"]

export default function AnimatedText() {
    const [index, setIndex] = useState(0);

    useEffect(() => {
        const timer = setTimeout(() => {
            setIndex((prev) => (prev + 1) % WORDS.length);
        }, 2000);

        return () => clearTimeout(timer);
    }, [index]);

    return (
        <span className="relative inline-block overflow-hidden ">
            <AnimatePresence mode="wait">
                <motion.span
                    key={WORDS[index]}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.4 }}
                    className="inline-block text-emerald-500 font-extrabold font-outfit italic"
                >
                    {WORDS[index]}
                </motion.span>
            </AnimatePresence>
        </span>
    );
}