"use client";

import { useSearchParams } from "next/navigation";
import { useMemo } from "react";

export function useUserParams() {
    const searchParams = useSearchParams();

    const userDetails = useMemo(() => {
        return {
            userId: searchParams.get('user_id'),
            accessToken: searchParams.get('user_token'),
            userName: searchParams.get('name'),
            userEmail: searchParams.get('email'),
            userPhone: searchParams.get('phoneNumber'),
        };
    }, [searchParams]);

    return userDetails;
}
