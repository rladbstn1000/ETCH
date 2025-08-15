package com.ssafy.etch.portfolio.service;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.ssafy.etch.global.exception.CustomException;
import com.ssafy.etch.global.exception.ErrorCode;
import com.ssafy.etch.member.entity.MemberEntity;
import com.ssafy.etch.member.repository.MemberRepository;
import com.ssafy.etch.portfolio.dto.*;
import com.ssafy.etch.portfolio.entity.PortfolioEntity;
import com.ssafy.etch.portfolio.entity.PortfolioProjectEntity;
import com.ssafy.etch.portfolio.repository.PortfolioProjectRepository;
import com.ssafy.etch.portfolio.repository.PortfolioRepository;
import com.ssafy.etch.project.dto.ProjectDTO;
import com.ssafy.etch.project.entity.ProjectEntity;
import com.ssafy.etch.project.entity.ProjectTechEntity;
import com.ssafy.etch.project.repository.ProjectRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.Collections;
import java.util.List;
import java.util.function.Function;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class PortfolioServiceImpl implements PortfolioService {

    private final PortfolioRepository portfolioRepository;
    private final ProjectRepository projectRepository;
    private final PortfolioProjectRepository portfolioProjectRepository;
    private final MemberRepository memberRepository;
    private final ObjectMapper objectMapper;

    @Override
    @Transactional
    public List<PortfolioListResponseDTO> getPortfolioList(Long memberId) {

        memberRepository.findById(memberId)
                .orElseThrow(() -> new CustomException(ErrorCode.USER_NOT_FOUND));

        return portfolioRepository.findAllByMember_IdAndIsDeletedIsFalse(memberId)
                .stream()
                .map(PortfolioEntity::toPortfolioDTO)
                .map(PortfolioListResponseDTO::from)
                .toList();
    }

    @Override
    @Transactional
    public void savePortfolio(Long memberId, PortfolioRequestDTO portfolioRequestDTO) {
        MemberEntity memberEntity = memberRepository.findById(memberId)
                .orElseThrow(() -> new CustomException(ErrorCode.USER_NOT_FOUND));

        String techList = techListToString(portfolioRequestDTO);

        PortfolioDTO portfolioDTO = portfolioRequestDTO
                .toPortfolioDTO(techList)
                .toBuilder()
                .member(memberEntity)
                .createdAt(LocalDate.now())
                .build();

        PortfolioEntity savedPortfolio = portfolioRepository.save(PortfolioEntity.from(portfolioDTO));
        List<Long> projectIds = portfolioRequestDTO.getProjectIds();
        List<PortfolioProjectEntity> savedEntities = getSavedEntities(savedPortfolio, projectIds);

        PortfolioEntity.updateProjectInfo(savedPortfolio, savedEntities);
    }

    @Override
    @Transactional
    public void updatePortfolio(Long memberId, Long portfolioId, PortfolioRequestDTO portfolioRequestDTO) {
        memberRepository.findById(memberId)
                .orElseThrow(() -> new CustomException(ErrorCode.USER_NOT_FOUND));

        PortfolioEntity portfolioEntity = portfolioRepository.findById(portfolioId)
                .orElseThrow(() -> new CustomException(ErrorCode.CONTENT_NOT_FOUND));

        portfolioEntity.clear();
        portfolioProjectRepository.deleteByPortfolioId(portfolioId);

        List<Long> projectIds = portfolioRequestDTO.getProjectIds();
        List<PortfolioProjectEntity> savedEntities = getSavedEntities(portfolioEntity, projectIds);

        String techList = techListToString(portfolioRequestDTO);
        portfolioEntity.updateAll(portfolioRequestDTO, techList, savedEntities);
    }

    @Override
    @Transactional
    public void deletePortfolio(Long memberId, Long portfolioId) {
        memberRepository.findById(memberId)
                .orElseThrow(() -> new CustomException(ErrorCode.USER_NOT_FOUND));

        PortfolioEntity portfolioEntity =portfolioRepository.findById(portfolioId)
                .orElseThrow(() -> new CustomException(ErrorCode.CONTENT_NOT_FOUND));

        if (!portfolioEntity.toPortfolioDTO().getMember().toMemberDTO().getId().equals(memberId)) {
            throw new CustomException(ErrorCode.ACCESS_DENIED);
        }

        portfolioEntity.updateStatus();
    }

    @Override
    @Transactional(readOnly = true)
    public PortfolioDetailResponseDTO getPortfolioDetail(Long memberId, Long portfolioId) {
        memberRepository.findById(memberId)
                .orElseThrow(() -> new CustomException(ErrorCode.USER_NOT_FOUND));

        PortfolioEntity portfolioEntity = portfolioRepository.findById(portfolioId)
                .orElseThrow(() -> new CustomException(ErrorCode.CONTENT_NOT_FOUND));

        if(portfolioEntity.toPortfolioDTO().isDeleted()) {
            throw new CustomException(ErrorCode.CONTENT_DELETED);
        }
        if (!portfolioEntity.toPortfolioDTO().getMember().toMemberDTO().getId().equals(memberId)) {
            throw new CustomException(ErrorCode.ACCESS_DENIED);
        }

        PortfolioDTO portfolioDTO = portfolioEntity.toPortfolioDTO();

        return PortfolioDetailResponseDTO.from(portfolioDTO, stringToTechList(portfolioDTO.getTechList()));
    }

    private List<PortfolioProjectEntity> getSavedEntities(PortfolioEntity portfolioEntity, List<Long> projectIds) {
        if (projectIds == null) {
            return Collections.emptyList();
        }
        List<PortfolioProjectEntity> savedEntities = new ArrayList<>();

        for (Long projectId : projectIds) {
            ProjectEntity projectEntity = projectRepository.findById(projectId).orElseThrow(()-> new CustomException(ErrorCode.CONTENT_NOT_FOUND));

            PortfolioProjectEntity entity = PortfolioProjectEntity.builder()
                    .portfolio(portfolioEntity)
                    .project(projectEntity)
                    .build();
            PortfolioProjectEntity saved = portfolioProjectRepository.save(entity);
            savedEntities.add(saved);
        }
        return savedEntities;
    }

    private String techListToString(PortfolioRequestDTO dto) {
        List<String> list = dto.getTechList();
        if (list == null) {
            throw new CustomException(ErrorCode.INVALID_INPUT);
        }
        try {
            return objectMapper.writeValueAsString(list);
        } catch (JsonProcessingException e) {
            throw new CustomException(ErrorCode.INVALID_INPUT);
        }
    }
    private List<String> stringToTechList(String techList) {
        if (techList == null || techList.isBlank()) {
            return Collections.emptyList();
        }
        try {
            return objectMapper.readValue(techList, new TypeReference<List<String>>() {});
        } catch (JsonProcessingException e) {
            throw new CustomException(ErrorCode.INVALID_INPUT); // 입력 문제로 처리
        }
    }
}
