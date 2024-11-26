import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import { observable } from '@legendapp/state';
import { enableReactUse } from '@legendapp/state/config/enableReactUse';
import { useMount } from '@legendapp/state/react';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}


enableReactUse();

const canRender = observable(false);

export function useCanRender(): boolean {
    useMount(() => {
        canRender.set(true);
    });
    return canRender.use();
}