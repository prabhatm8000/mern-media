import { formatDistanceToNow } from "date-fns";
import { NotificationsDataType } from "../../../backend/src/types/types";

// image
import defaultProfilePicture from "../statics/images/default-profile-picture.svg";
import { Link } from "react-router-dom";

interface NotificationCardProps {
    data: NotificationsDataType;
}

const NotificationCard = ({ data }: NotificationCardProps) => {
    return (
        <Link
            to={
                data.postId
                    ? `/post/${data.postId}`
                    : `/profile/${data.notificationForm.userId}`
            }
            className={`flex gap-2 p-2 rounded-md bg-neutral-800 ${data.readStatus ? "opacity-70" : ""}`}
        >
            <img
                className={`${data.readStatus ? "" : ""} p-[2.5px] rounded-full w-[40px] h-[40px] hover:scale-125 transition ease-in-out delay-100 duration-300`}
                src={
                    data.notificationForm.profilePictureUrl === ""
                        ? defaultProfilePicture
                        : data.notificationForm.profilePictureUrl
                }
                alt={data.notificationForm.username}
                title={data.notificationForm.username}
            />
            <div className="flex flex-col gap-0">
                <span className="text-sm text-neutral-200">
                    {formatDistanceToNow(new Date(data.at))} ago
                </span>
                <span>
                    <b>{data.notificationForm.username} </b>
                    {data.notificationFor}
                </span>
            </div>
        </Link>
    );
};

export default NotificationCard;
