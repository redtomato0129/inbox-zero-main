import { forwardRef } from "react";

export const Checkbox = forwardRef(
  (
    props: {
      checked: boolean;
      onChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
    },
    ref: React.Ref<HTMLInputElement>,
  ) => {
    return (
      <input
        type="checkbox"
        className="h-4 w-4 cursor-pointer rounded border-gray-300 text-black focus:ring-black"
        ref={ref}
        checked={props.checked}
        onChange={props.onChange}
      />
    );
  },
);

Checkbox.displayName = "Checkbox";
