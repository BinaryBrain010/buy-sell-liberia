import SellForm from "./SellForm"

export default function SellPage() {
  return (
    <div className="container mx-auto py-8">
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold mb-2">Sell Your Item</h1>
        <p className="text-muted-foreground">Create a listing to sell your item to thousands of potential buyers</p>
      </div>
      <SellForm />
    </div>
  )
}
