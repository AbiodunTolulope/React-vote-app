// src/hooks/useUserPolls.js
import { useState, useEffect } from 'react';
import { db } from '../firebase';
import {
    collection,
    query,
    where,
    onSnapshot,
    orderBy,
    doc,
    deleteDoc,
    updateDoc,
    arrayRemove
} from 'firebase/firestore';

export const useUserPolls = (user) => {
    const [polls, setPolls] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (!user || !user.uid) {
            setLoading(false);
            return;
        }

        setLoading(true);

        // Query polls created by the user, ordered by newest first
        const pollsQuery = query(
            collection(db, "polls"),
            where("creatorId", "==", user.uid),
            orderBy("createdAt", "desc")
        );

        const unsubscribe = onSnapshot(pollsQuery,
            (querySnapshot) => {
                const pollsData = [];
                querySnapshot.forEach((doc) => {
                    const pollData = doc.data();
                    pollsData.push({
                        id: doc.id,
                        question: pollData.question,
                        options: pollData.options || {},
                        totalVotes: pollData.totalVotes || 0,
                        createdAt: pollData.createdAt,
                        creatorEmail: pollData.creatorEmail,
                        creatorId: pollData.creatorId
                    });
                });

                setPolls(pollsData);
                setLoading(false);
                setError(null);
            },
            (err) => {
                console.error("Error listening to polls:", err);
                setError("Failed to load polls. Please try again.");
                setLoading(false);
            }
        );

        return () => unsubscribe();
    }, [user]);

    const deletePoll = async (pollId) => {
        if (!user) return;
        try {
            // 1. Remove from user's list
            const userRef = doc(db, "users", user.uid);
            await updateDoc(userRef, {
                createdPolls: arrayRemove(pollId)
            });
            // 2. Delete document
            const pollRef = doc(db, "polls", pollId);
            await deleteDoc(pollRef);
            return true;
        } catch (err) {
            console.error("Error deleting poll:", err);
            throw err;
        }
    };

    return { polls, loading, error, deletePoll };
};
