import clsx from "clsx";
import React from "react";

type TypographyVariant =
  | "title"
  | "body"
  | "caption"
  | "small"
  | "h1"
  | "h2"
  | "h3"
  | "h4"
  | "h5"
  | "h6";

const fontVariantStyles: Record<
  TypographyVariant,
  { component: keyof JSX.IntrinsicElements; styles: string[] }
> = {
  title: {
    component: "h1",
    styles: ["text-5xl", "font-black"],
  },
  body: {
    component: "p",
    styles: ["text-base	"],
  },
  caption: {
    component: "p",
    styles: ["text-base", "italic"],
  },
  small: {
    component: "small",
    styles: ["text-sm"],
  },
  h1: {
    component: "h1",
    styles: ["text-3xl"],
  },
  h2: {
    component: "h2",
    styles: ["text-2xl"],
  },
  h3: {
    component: "h3",
    styles: ["text-xl"],
  },
  h4: {
    component: "h4",
    styles: ["text-base"],
  },
  h5: {
    component: "h5",
    styles: ["text-base"],
  },
  h6: {
    component: "h6",
    styles: ["text-base"],
  },
};

type TypographyProps = {
  variant: TypographyVariant;
  children: React.ReactNode;
};

const Typography: React.FC<TypographyProps> = ({ variant, children }) => {
  const Variant = fontVariantStyles[variant];
  return (
    <Variant.component className={clsx(Variant.styles)}>
      {children}
    </Variant.component>
  );
};

export default Typography;
