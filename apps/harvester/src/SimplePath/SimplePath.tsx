import { PathSteps } from "./Steps";
import { ContentSection } from "@/ContentSection";
import { Path } from "./types";
import { Outlet } from "react-router";
import { PathNextButton } from "./NextButton";
import { SimplePathContext } from "./SimplePathContext";

export const SimplePath = <T, >({ path, data }: { path: Path<T>, data: T }) => {
  return (
    <SimplePathContext.Provider value={{ path, data }}>
      <div>
        <PathSteps path={path} data={data}/>
        <ContentSection>
          <Outlet />
          <PathNextButton />
        </ContentSection>
      </div>
    </SimplePathContext.Provider>
  )
}
