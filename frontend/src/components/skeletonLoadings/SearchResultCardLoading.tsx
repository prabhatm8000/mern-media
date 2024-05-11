import Skeleton from "react-loading-skeleton";

const SearchResultCardLoading = () => {
    return (
        <div className="flex items-center gap-3 w-fit hover:scale-105 hover:translate-x-[5px] transition-transform delay-50 duration-500">
            <div className="size-[50px] rounded-full">
                <Skeleton className="size-[50px]" circle={true} />
            </div>
            <div className="-mb-2">
                <Skeleton width={"15rem"} count={1} />
                <Skeleton width={"12rem"} className="text-sm" count={1} />
            </div>
        </div>
    );
};

export default SearchResultCardLoading;
