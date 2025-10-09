import { FC } from "react";

interface IProps {
  href: string;
  children: React.ReactNode;
}

export const SocialMediaButton: FC<IProps> = (props) => {
  const { href, children } = props;
  return (
    <a
      href={href}
      target="_blank"
      rel={"noopener noreferrer"}
      className="group"
    >
      {children}
    </a>
  );
};
