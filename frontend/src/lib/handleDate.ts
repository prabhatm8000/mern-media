export const handleDate = (d: Date): string => {
    const currDate = new Date();
    if (currDate.getDate() === d.getDate()) {
        return d.toLocaleTimeString("en-US", {
            hour12: true,
            timeStyle: "short",
        });
    }
    return d.toLocaleDateString(undefined, {
        day: "2-digit",
        month: "2-digit",
        year: "2-digit",
    });
};

export const handleMessageDate = (
    a: Date,
    b: Date,
    option?: { last: boolean }
): string => {
    const currDate = new Date();

    if (
        a.getDate() !== b.getDate() ||
        a.getMonth() !== b.getMonth() ||
        a.getFullYear() !== b.getFullYear() ||
        (option && option.last)
    ) {
        return b.getDate() === currDate.getDate() &&
            b.getMonth() === currDate.getMonth() &&
            b.getFullYear() === currDate.getFullYear()
            ? "Today"
            : b.toLocaleDateString(undefined, {
                  day: "2-digit",
                  month: "2-digit",
                  year: "2-digit",
              });
    }
    return "";
};
