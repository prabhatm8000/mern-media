import { formatDistanceToNow } from "date-fns";

// image
import defaultProfilePicture from "../statics/images/default-profile-picture.svg";
import { Link } from "react-router-dom";
import { NotificationsDataType } from "../../../backend/src/types/types";

interface NotificationCardProps {
    data: NotificationsDataType;
}

const NotificationCard = ({ data }: NotificationCardProps) => {
    return (
        <Link
            to={
                data.postId
                    ? `/post/${data.postId}`
                    : `/profile/${data.notificationFrom.userId}`
            }
            className={`flex gap-2 p-2 rounded-md bg-black2 ${data.readStatus ? "opacity-50" : ""}`}
        >
            <img
                className={`${data.readStatus ? "" : ""} p-[2.5px] rounded-full w-[40px] h-[40px] hover:scale-125 transition ease-in-out delay-100 duration-300`}
                onError={() => {
                    data.notificationFrom.profilePictureUrl = defaultProfilePicture;
                }}
                src={
                    data.notificationFrom.profilePictureUrl === ""
                        ? defaultProfilePicture
                        : data.notificationFrom.profilePictureUrl
                }
                alt={data.notificationFrom.username}
                title={data.notificationFrom.username}
            />
            <div className="flex flex-col gap-0">
                <span className="text-sm">
                    {formatDistanceToNow(new Date(data.at))} ago
                </span>
                <span>
                    <b>{data.notificationFrom.username} </b>
                    {data.notificationFor}
                </span>
            </div>
        </Link>
    );
};

export default NotificationCard;
