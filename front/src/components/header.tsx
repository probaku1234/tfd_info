import React from 'react';
import { Box, Flex, Link } from '@chakra-ui/react';
import { Link as GatsbyLink } from 'gatsby';

const Header = () => {
  return (
    <Box as="header" bg="blue.700" color="white" py={4} px={8}>
      <Flex as="nav" justify="space-between" align="center">
        <Box>
          <Link as={GatsbyLink} to="/" fontWeight="bold" fontSize="xl">
            TFD INFO
          </Link>
        </Box>
        <Flex flex="1" justify="center">
          {/* <Link as={GatsbyLink} to="/" mx={2}>
            계승자 정보 조회
          </Link> */}
          <Link as={GatsbyLink} to="/reward_rotation" mx={2}>
            난이도 보상 로테이션
          </Link>
          <Link as={GatsbyLink} to="/modules" mx={2}>
            모듈
          </Link>
          {/* <Link as={GatsbyLink} to="/contact" mx={2}>
            Contact
          </Link> */}
        </Flex>
      </Flex>
    </Box>
  );
};

export default Header;