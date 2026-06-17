import "./globals.css";

export const metadata = {
  title: "EduMate AI - AI Tutor Chat",
  description: "Interactive AI Tutor and Practice Quiz for Haryana Board Students",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <link
          rel="stylesheet"
          href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css"
          precedence="default"
        />
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Manrope:wght@400;500;600;700&family=Outfit:wght@300;400;600;800&display=swap"
          precedence="default"
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
