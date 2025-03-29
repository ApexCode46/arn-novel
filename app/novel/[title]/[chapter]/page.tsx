"use client"
import { useParams } from "next/navigation";

export default function ChapterPage() {
  const params = useParams();
  const bookId = params.title;
  const chapterId = params.chapter;
  console.log(params);
  return (
    <div>
      <h1>Book: {bookId}</h1>
      <h2>Chapter: {chapterId}</h2>
      <p>This is a placeholder for Chapter {chapterId} content.</p>
    </div>
  );
};

