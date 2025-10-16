interface CardProps {
  title: string;
  value: string | number;
}

export default function Card({ title, value }: CardProps) {
  return (
    <div className="bg-white dark:bg-gray-800 p-6 rounded shadow">
      <h2 className="font-bold text-lg">{title}</h2>
      <p className="text-2xl mt-2">{value}</p>
    </div>
  );
}
