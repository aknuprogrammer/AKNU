import { formatDistanceToNow } from "date-fns";

export const getTimeDistanceString = (date) => {
    const timeAgo = formatDistanceToNow(new Date(date), { addSuffix: true });
    return timeAgo;
};
