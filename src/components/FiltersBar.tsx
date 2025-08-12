interface Props {
  children: React.ReactNode;
}

export default function FiltersBar({ children }: Props) {
  return <div className="flex space-x-2 mb-4">{children}</div>;
}
