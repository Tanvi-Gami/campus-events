export default function Loader({ text = "Loading..." }) {
  return (
    <div className="flex items-center justify-center p-10">
      <p className="text-gray-600 text-lg animate-pulse">
        {text}
      </p>
    </div>
  )
}
