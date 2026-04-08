interface ErrorMessageProps {
  message: string;
}

export default function ErrorMessage({ message }: ErrorMessageProps) {
  return (
    <div className="error p-2 border-l-4 border-red-500 mt-2">
      {message} <span className="blink">_</span>
    </div>
  );
}

