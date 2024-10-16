import React, { createContext, useState, useEffect } from "react";

interface AuthContextType {
    isLoggedIn: boolean;
    isAdmin: boolean;
    isDriver: boolean,
    userId: string | null;
    setLoggedIn: (isLoggedIn: boolean, isAdmin?: boolean, isDriver?: boolean, userId?: string) => void;
}

interface Props {
    children: React.ReactNode;
}

export const AuthContext = createContext<AuthContextType>({
    isLoggedIn: false,
    isAdmin: false,
    isDriver: false,
    userId: '',
    setLoggedIn: () => { },
});

const AuthProvider: React.FC<Props> = ({ children }) => {
    const [isLoggedIn, setLoggedIn] = useState(false);
    const [isAdmin, setIsAdmin] = useState(false);
    const [isDriver, setIsDriver] = useState(false);
    const [userId, setUserId] = useState<string | null>(null);

    useEffect(() => {
        const userToken = sessionStorage.getItem("userToken");
        const userId = sessionStorage.getItem("userId");
        const storedIsAdmin = JSON.parse(sessionStorage.getItem("isAdmin") || "false");
        const storedIsDriver = JSON.parse(sessionStorage.getItem("isDriver") || "false");
        if (userToken) {
            setLoggedIn(true);
            setIsAdmin(storedIsAdmin);
            setIsDriver(storedIsDriver);
            setUserId(userId);
        }
    }, []);

    const updateLoggedInState = (
        isLoggedIn: boolean,
        isAdmin: boolean = false,
        isDriver: boolean = false,
        userId: string = ""
    ) => {
        setLoggedIn(isLoggedIn);
        setIsAdmin(isAdmin);
        setIsDriver(isDriver);
        setUserId(isLoggedIn ? userId : null);
        sessionStorage.setItem("userToken", isLoggedIn ? "true" : "");
        sessionStorage.setItem("isAdmin", JSON.stringify(isAdmin));
        sessionStorage.setItem("isDriver", JSON.stringify(isDriver));
        sessionStorage.setItem("userId", isLoggedIn ? userId : "");
    };


    return (
        <AuthContext.Provider value={{ isLoggedIn, isAdmin, isDriver, userId, setLoggedIn: updateLoggedInState }}>
            {children}
        </AuthContext.Provider>

    );
};

export default AuthProvider;
