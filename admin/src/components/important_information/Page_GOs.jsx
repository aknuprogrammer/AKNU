import Template_FormPage from "./Template_FormPage";

export default function Page_GOs() {
    return (
        <Template_FormPage
            title={"Create New Government Order (G.O)"}
            itemName="G.O"
            resourceName="gos"
            isModal={true}
            noRadius={true}
            buttonText="Add G.O"
            hideIcon={true}
            maxFileSize={5 * 1024 * 1024}
        />
    );
}
