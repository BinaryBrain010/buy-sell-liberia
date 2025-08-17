import SellForm from "./SellForm"

export default function SellPage() {
  return (
    <div className="min-h-screen">
      <div className="container mx-auto py-6 px-4">
        <div className="max-w-5xl mx-auto">
          <div className="mb-6 text-center">
            <h1 className="text-2xl font-bold mb-2">
              Sell Your Item
            </h1>
            <p className="text-muted-foreground text-sm">
              Create a listing to sell your item to thousands of potential buyers
            </p>
          </div>
          <SellForm />
        </div>
      </div>
    </div>
  )
}
