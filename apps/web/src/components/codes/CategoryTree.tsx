import { Category } from '../../types';

interface CategoryTreeProps {
  categories: Category[];
}

export const CategoryTree = ({ categories }: CategoryTreeProps) => {
  const rootCategories = categories.filter((c) => !c.parentId);

  const renderCategory = (category: Category, level = 0) => {
    const children = categories.filter((c) => c.parentId === category._id);

    return (
      <div key={category._id} style={{ marginLeft: level * 20 }}>
        <div className="py-2 px-3 hover:bg-gray-50 rounded">
          {category.name}
        </div>
        {children.map((child) => renderCategory(child, level + 1))}
      </div>
    );
  };

  return (
    <div className="space-y-1">
      {rootCategories.map((cat) => renderCategory(cat))}
    </div>
  );
};
