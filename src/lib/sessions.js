

const SESSION_KEY = "demo_session";

export default function createSession(){

    if( typeof window == "undefined")return;

    sessionStorage.setItem(
        SESSION_KEY,
        JSON.stringify(user)
    )
}

export default function getSession(){
    if(typeof window === "undefined") return null;

    const session = localStorage.getItem(SESSION_KEY);

    return session ? JSON.parse(session) : null;
}

export default function isSignedIn(){
    return getSession() !== null;
}

export default function clearSession(){

    if(typeof window === "undefined")return;

    localStorage.removeItem(SESSION_KEY);
}