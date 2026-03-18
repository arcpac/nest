"use client";

import { CSSProperties, FunctionComponent, useEffect, useMemo } from "react";
import Select, { ClearIndicatorProps, MultiValue } from "react-select";
import makeAnimated from "react-select/animated";
import { CSSObject } from "@emotion/serialize";
import { Member } from "@/app/types";

const CustomClearText: FunctionComponent = () => <>clear all</>;
const animatedComponents = makeAnimated();

export type MemberOption = {
    value: string;
    label: string;
    member: Member;
};

type SelectFieldProps = {
    members?: Member[];
    selectedMemberIds?: string[];
    isOpen?: boolean;
    selectedMembers: MemberOption[];
    setSelectedMembers: (members: MemberOption[]) => void;
};

const ClearIndicator = (props: ClearIndicatorProps<MemberOption, true>) => {
    const {
        children = <CustomClearText />,
        getStyles,
        innerProps: { ref, ...restInnerProps },
    } = props;
    return (
        <div
            {...restInnerProps}
            ref={ref}
            style={getStyles("clearIndicator", props) as CSSProperties}
        >
            <div style={{ padding: "0px 5px" }}>{children}</div>
        </div>
    );
};

const ClearIndicatorStyles = (
    base: CSSObject,
    state: ClearIndicatorProps<MemberOption>
): CSSObject => ({
    ...base,
    cursor: "pointer",
    color: state.isFocused ? "blue" : "black",
});

const SelectField = ({
    members,
    selectedMemberIds,
    isOpen,
    selectedMembers,
    setSelectedMembers,
}: SelectFieldProps) => {
    const memberOptions: MemberOption[] = useMemo(
        () =>
            (members ?? []).map((member) => {
                const name = member.first_name === null && member.last_name === null ? member.email.trim() : `${member.first_name ?? ""} ${member.last_name ?? ""}`.trim();
                return {
                    value: member.id,
                    label: name,
                    member,
                };
            }),
        [members]
    );

    const selectedOptions: MemberOption[] = useMemo(() => {
        if (!selectedMemberIds?.length) return [];

        const selectedSet = new Set(selectedMemberIds);
        return memberOptions.filter((opt) => selectedSet.has(opt.value));
    }, [memberOptions, selectedMemberIds]);

    useEffect(() => {
        if (isOpen === false) return;
        setSelectedMembers(selectedOptions);
    }, [isOpen, selectedOptions, setSelectedMembers]);

    return (
        <Select<MemberOption, true>
            isMulti
            closeMenuOnSelect={false}
            components={{ ...animatedComponents, ClearIndicator }}
            styles={{ clearIndicator: ClearIndicatorStyles }}
            options={memberOptions}
            value={selectedMembers} // ✅ controlled
            onChange={(value: MultiValue<MemberOption>) =>
                setSelectedMembers(value as MemberOption[])
            }
        />
    )
}

export default SelectField
