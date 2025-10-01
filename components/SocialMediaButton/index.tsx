import React from "react";

interface IProps {
  href: string;
  children: React.ReactNode;
}

const SocialMediaButton: React.FC<IProps> = (props) => {
  const { href, children } = props;
  return (
    <a href={href} target="_blank" rel={"noopener noreferrer"}>
      {children}
    </a>
  );
};

export default SocialMediaButton;
