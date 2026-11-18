import React, { createContext, useContext, useState, useEffect, useCallback, useRef, useMemo } from "react";
import { API } from "../config/urls";
import { showAxiosError } from "../config/Toast";

const LetterHeadContext = createContext();

export const useLetterHead = () => {
    const context = useContext(LetterHeadContext);
    if (!context) {
        throw new Error("useLetterHead must be used within a LetterHeadProvider");
    }
    return context;
};

export const LetterHeadProvider = ({ children }) => {
    const [letters, setLetters] = useState([]);
    const [createdLetters, setCreatedLetters] = useState([]);
    const [userRequests, setUserRequests] = useState([]);
    const [departments, setDepartments] = useState([]);
    const [isLoading, setIsLoading] = useState({
        letters: false,
        createdLetters: false,
        requests: false,
        departments: false
    });

    // Caching/Refresh Logic
    const lastFetch = useRef({
        letters: 0,
        createdLetters: 0,
        requests: 0,
        departments: 0
    });
    
    // Cache expiry: 1 hour (Effectively making it refresh-only per user instruction)
    const EXPIRE_TIME = 3600000;

    const activeFetches = useRef({ 
        letters: false, 
        createdLetters: false, 
        requests: false, 
        departments: false 
    });

    const fetchLetters = useCallback(async (force = false) => {
        if (activeFetches.current.letters) return;
        if (!force && Date.now() - lastFetch.current.letters < EXPIRE_TIME) return;
        
        activeFetches.current.letters = true;
        setIsLoading(prev => ({ ...prev, letters: true }));
        try {
            const role = localStorage.getItem("role")?.toLowerCase();
            const isAdmin = ["super_admin", "admin"].includes(role);
            const resp = await API.get(`/letters${isAdmin ? "?all=true" : ""}`);
            setLetters(resp.data || []);
            lastFetch.current.letters = Date.now();
        } catch (error) {
            console.error("Error fetching templates:", error);
        } finally {
            setIsLoading(prev => ({ ...prev, letters: false }));
            activeFetches.current.letters = false;
        }
    }, []);

    const fetchCreatedLetters = useCallback(async (force = false) => {
        if (activeFetches.current.createdLetters) return;
        if (!force && Date.now() - lastFetch.current.createdLetters < EXPIRE_TIME) return;
        
        activeFetches.current.createdLetters = true;
        setIsLoading(prev => ({ ...prev, createdLetters: true }));
        try {
            const role = localStorage.getItem("role")?.toLowerCase();
            const isAdmin = ["super_admin", "admin"].includes(role);
            const resp = await API.get(`/letters/created-letters${isAdmin ? "?all=true" : ""}`);
            setCreatedLetters(resp.data || []);
            lastFetch.current.createdLetters = Date.now();
        } catch (error) {
            console.error("Error fetching generated letters:", error);
        } finally {
            setIsLoading(prev => ({ ...prev, createdLetters: false }));
            activeFetches.current.createdLetters = false;
        }
    }, []);

    const fetchUserRequests = useCallback(async (force = false) => {
        if (activeFetches.current.requests) return;
        if (!force && Date.now() - lastFetch.current.requests < EXPIRE_TIME) return;
        
        activeFetches.current.requests = true;
        setIsLoading(prev => ({ ...prev, requests: true }));
        try {
            const role = localStorage.getItem("role")?.toLowerCase();
            // Authorized management roles can see all requests for approval
            const canSeeAllRequests = ["super_admin", "admin", "vc", "registrar"].includes(role);
            const resp = await API.get(`/letters/get-requests${canSeeAllRequests ? "?all=true" : ""}`);
            const data = resp.data?.data || resp.data || [];
            setUserRequests(data);
            lastFetch.current.requests = Date.now();
        } catch (error) {
            console.error("Error fetching requests:", error);
        } finally {
            setIsLoading(prev => ({ ...prev, requests: false }));
            activeFetches.current.requests = false;
        }
    }, []);

    const fetchDepartments = useCallback(async (force = false) => {
        if (activeFetches.current.departments) return;
        if (!force && Date.now() - lastFetch.current.departments < EXPIRE_TIME) return;
        
        activeFetches.current.departments = true;
        setIsLoading(prev => ({ ...prev, departments: true }));
        try {
            const resp = await API.get("/departments/");
            const formatted = resp.data.map(e => ({
                label: `${e.title} - (${e.shortCode})`,
                value: e._id,
                code: e.shortCode,
            }));
            setDepartments(formatted);
            lastFetch.current.departments = Date.now();
        } catch (error) {
            console.error("Error fetching departments:", error);
        } finally {
            setIsLoading(prev => ({ ...prev, departments: false }));
            activeFetches.current.departments = false;
        }
    }, []);

    // Initial Load - ONLY if data is missing
    useEffect(() => {
        if (!letters.length) fetchLetters();
        if (!createdLetters.length) fetchCreatedLetters();
        if (!userRequests.length) fetchUserRequests();
        if (!departments.length) fetchDepartments();
    }, [fetchLetters, fetchCreatedLetters, fetchUserRequests, fetchDepartments, letters.length, createdLetters.length, userRequests.length, departments.length]);

    const refreshLetters = useCallback(() => fetchLetters(true), [fetchLetters]);
    const refreshCreatedLetters = useCallback(() => fetchCreatedLetters(true), [fetchCreatedLetters]);
    const refreshRequests = useCallback(() => fetchUserRequests(true), [fetchUserRequests]);
    const refreshDepartments = useCallback(() => fetchDepartments(true), [fetchDepartments]);

    const value = useMemo(() => ({
        letters,
        createdLetters,
        userRequests,
        departments,
        isLoading,
        refreshLetters,
        refreshCreatedLetters,
        refreshRequests,
        refreshDepartments,
        setLetters,
        setCreatedLetters,
        setUserRequests
    }), [letters, createdLetters, userRequests, departments, isLoading, refreshLetters, refreshCreatedLetters, refreshRequests, refreshDepartments]);

    return (
        <LetterHeadContext.Provider value={value}>
            {children}
        </LetterHeadContext.Provider>
    );
};
