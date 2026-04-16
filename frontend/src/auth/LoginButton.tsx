import { useAuth } from './AuthContext';
import styles from './LoginButton.module.css';

export function LoginButton() {
  const { user, isLoading, signInWithGoogle, signOut } = useAuth();

  if (isLoading) return null;

  if (user) {
    return (
      <div className={styles.userInfo}>
        {user.user_metadata?.avatar_url && (
          <img
            src={user.user_metadata.avatar_url}
            alt=""
            className={styles.avatar}
          />
        )}
        <span>{user.user_metadata?.full_name ?? user.email}</span>
        <button onClick={signOut} className={styles.signOutButton}>
          Sair
        </button>
      </div>
    );
  }

  return (
    <div className={styles.loginArea}>
      <button onClick={signInWithGoogle} className={styles.loginButton}>
        Entrar com Google
      </button>
    </div>
  );
}
