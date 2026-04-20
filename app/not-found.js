import Link from 'next/link';

export default function NotFound() {
  return (
    <div style={containerStyle}>
      <div style={cardStyle}>
        <h1 style={titleStyle}>404</h1>
        <h2 style={subtitleStyle}>Страница не найдена</h2>
        <p style={textStyle}>
          Похоже, видео или страница, которую вы искали, была удалена, закрыта или никогда не существовала.
        </p>
        
        <div style={buttonsStyle}>
          <Link href="/" style={primaryButtonStyle}>
            На главную
          </Link>
          
          <Link href="/converter" style={secondaryButtonStyle}>
            Попробовать конвертер
          </Link>
        </div>
      </div>
    </div>
  );
}

// Стили прямо в коде (inline styles)
const containerStyle = {
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  minHeight: '100vh',
  backgroundColor: '#f3f4f6',
  padding: '20px',
  fontFamily: 'Arial, sans-serif',
};

const cardStyle = {
  backgroundColor: 'white',
  padding: '40px',
  borderRadius: '12px',
  boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
  maxWidth: '500px',
  width: '100%',
  textAlign: 'center',
};

const titleStyle = {
  fontSize: '72px',
  fontWeight: 'bold',
  color: '#2563eb', // синий цвет
  margin: '0 0 20px 0',
};

const subtitleStyle = {
  fontSize: '24px',
  fontWeight: '600',
  color: '#1f2937',
  margin: '0 0 10px 0',
};

const textStyle = {
  fontSize: '16px',
  color: '#4b5563',
  marginBottom: '30px',
  lineHeight: '1.5',
};

const buttonsStyle = {
  display: 'flex',
  flexDirection: 'column',
  gap: '15px',
};

const primaryButtonStyle = {
  display: 'block',
  padding: '12px 24px',
  backgroundColor: '#2563eb',
  color: 'white',
  textDecoration: 'none',
  borderRadius: '8px',
  fontWeight: 'bold',
  transition: 'background-color 0.2s',
};

const secondaryButtonStyle = {
  display: 'block',
  padding: '12px 24px',
  backgroundColor: '#e5e7eb',
  color: '#1f2937',
  textDecoration: 'none',
  borderRadius: '8px',
  fontWeight: 'bold',
  transition: 'background-color 0.2s',
};
