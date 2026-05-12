const API = 'http://localhost:8000'

export default function Avatar({ user, size = 36, fontSize }) {
  const dim = size
  const fs = fontSize ?? Math.round(dim * 0.4)

  if (user?.avatar_url) {
    return (
      <img
        src={`${API}${user.avatar_url}`}
        alt={user.username}
        style={{ width: dim, height: dim, borderRadius: '50%', objectFit: 'cover', flexShrink: 0 }}
      />
    )
  }

  return (
    <div style={{
      width: dim, height: dim, borderRadius: '50%',
      background: user?.avatar_color || '#6366F1',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      color: '#fff', fontWeight: 700, fontSize: fs, flexShrink: 0,
    }}>
      {user?.username?.[0]?.toUpperCase()}
    </div>
  )
}
