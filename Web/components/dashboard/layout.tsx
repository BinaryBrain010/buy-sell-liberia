import AccountDetails from "./account-details"
import EditProfileForm from "./edit-profile-form"
import MyListings from "./my-listings"
import FavouriteListings from "./favourite-listings"
import ChatList from "./chat-list"

interface Props {
  section: string
}

export default function DashboardLayout({ section }: Props) {
  return (
    <main className="flex-1 p-6">
      {section === "account" && <AccountDetails />}
      {section === "edit" && <EditProfileForm />}
      {section === "listings" && <MyListings />}
      {section === "favourites" && <FavouriteListings />}
      {section === "chats" && <ChatList />}
    </main>
  )
}
