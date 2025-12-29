import { useEffect, useState } from "react";
import { getProfile } from "../services/protectedAuth";

export function Profile() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    getProfile().then((data) => setUser(data.user));
  }, []);

  if (!user) return <p>Loading...</p>;

  return (
    <div>
      <h2>Welcome {user.name}</h2>
      <p>{user.email}</p>
    </div>
  );
}
